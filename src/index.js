/**
 * @file FlexTable.
 * @author nozalr <nozalr@group4layers.com> (Group4Layers®).
 * @copyright 2017 nozalr (Group4Layers®).
 * @license MIT
 * @version 0.3.0
 * @description
 *
 * This docs are generated from the source code, and therefore, they are concise and simple.
 *
 * **For a complete documentation full of examples, use cases, general overview and the most
 * important points of the API, please, see the README.md in [flextable](https://github.com/Group4Layers/flextable)**.
 */

const sorter = require('./sorter');
const sorters = sorter.sorters;
const sortChain = sorter.sortChain;
const chainHeaderToIdx = sorter.chainHeaderToIdx;
const formatter = require('./formatter');

/**
 * @typedef {Object} Table - Data structure.
 * @type FlexTable
 * @prop {string[]} headers - can be empty if no headers.
 * @prop {int} _hlength - number of headers.
 * @prop {any[]} values - can be empty if no values.
 * @prop {int} _vlength - number of values (rows).
 * @prop {Object.<string,int>} idx - indices of headers.
 * @description
 *
 * Table object data structure (an instantiation of FlexTable).
 *
 * A valid Table could be:
 * ```js
 * let table = new FlexTable();
 * ```
 *
 * The table can be modified in a fine-grained way like this:
 * ```js
 * let idx = table.idx;
 * // increment in 1.05 the value of the second row with column header 'time'
 * table.values[1][idx['time']] += 1.05;
 * ```
 */

/**
 * @typedef {Object} TableSkel - Data structure.
 * @prop {string[]} headers - can be empty if no headers.
 * @prop {any[]} values - can be empty if no values.
 * @description
 *
 * Table object skeleton data structure.
 *
 * A valid TableSkel could be:
 * ```js
 * let table = new FlexTable();
 * ```
 * and also `{headers: [], values: []}`.
 */

/**
 * @typedef {Object} Format - Data structure.
 * @prop {string} header - Headers format.
 * @prop {string} float - Float format.
 * @prop {string} integer - Integer format.
 * @prop {string} string - String format.
 * @prop {string[]} columns - Column specific format.
 * @description
 *
 * Formatter object. It accepts these type of formats:
 * - `%s`: string.
 * - `%d`: integer.
 * - `%f`: float.
 * - `%-s`: string left aligned.
 * - `%-d`: integer left aligned.
 * - `%-f`: float left aligned.
 * - `%.4f`: float with 4 decimals (and other number of decimals).
 *
 * The column object receives the an array of formats. If a value is null it doesn't overwrite the format. It should provide as many formats as headers.
 */

/**
 * @typedef {('markdown'|'md'|'csv')} Formatter - Formatting style.
 */

/**
 * @class
 */
class FlexTable {
  /**
   * Constructor. It accepts an another FlexTable-like object (will be copied by reference).
   * It also accepts 2 arrays: headers and values.
   * @param {(string[]|TableSkel|null)} headers - array of strings (headers) or an object with headers and values.
   * @param {(string[]|null)} values - rows.
   */
  constructor(headers, values){
    this.reset(headers, values);
  }
  /**
   * It accepts an another FlexTable-like object (will be copied by reference).
   * It also accepts 2 arrays: headers and values.
   * @param {(string[]|TableSkel|null)} headers - array of strings (headers) or an object with headers and values.
   * @param {(string[]|null)} values - rows.
   */
  reset(headers, values){
    if (headers != null && values == null && !Array.isArray(headers)){
      values = headers.values;
      headers = headers.headers;
    }
    if (!Array.isArray(headers)){
      headers = [];
    }
    this.headers = headers;
    this._hlength = headers.length;
    this.values = [];
    this._vlength = 0;
    if (Array.isArray(values)){
      this.appendRows(values);
    }
    this._setHeadersIndex();
  }
  _setHeadersIndex(){
    let headers = this.headers;
    let idx = {};
    let i = 0;
    for (let h of headers){
      idx[h] = i++;
    }
    this.idx = idx;
  }
  // append
  // i == -1 the last

  /**
   * @param {row[]} rows - Rows to append to the values.
   * @description
   *
   * Append rows.
   *
   * It calls `#appendRow` for every row passed in the `rows` param.
   */
  appendRows(rows){
    let i = 0;
    for (let row of rows){
      this.appendRow(row, i);
      i++;
    }
  }
  /**
   * @param {col[]} row - Row to append to the values.
   * @throws if the number of cols doesn't match the number of headers.
   * @description
   *
   * Append a row.
   *
   * ```js
   * let table = new FlexTable(["col1"]);
   * // 0 rows
   * table.appendRow(["first"]);
   * // 1 row
   * table.appendRow(["last"]);
   * // 2 rows
   * ```
   */
  appendRow(row, i = 0){
    if (row.length !== this._hlength){
      throw new Error(`row ${i} length (${row.length}) is not equal to headers length (${this._hlength})`);
      // return; // err
    }
    this._vlength++;
    this.values.push(row);
  }
  /**
   * @param {int} i - Row number to be replaced/inserted.
   * @param {col[]} row - Row to append to the values.
   * @param {boolean} replace - If the row should replace the existing row.
   * @description
   *
   * Set a row in the values.
   *
   * ```js
   * // suppose there are at 2 rows at the beginning
   * table.setRow(0, ["first"], false); // will insert ["first"] in the first row
   * // now there are 3 rows
   * table.setRow(2, ["third"], false); // will insert ["third"] in the third row
   * // total: 3 rows
   * table.setRow(2, ["none"], true);   // will replace ["third"] with ["none"] in the third row
   * // total: 3 rows
   * ```
   *
   * `#appendRow` should be used to append a row or insert the first row in an empty table (no values)
   */
  setRow(i, row, replace){
    if (row && row.length !== this._hlength){
      return; // err
    }
    let _vlength = this._vlength;
    let rm = row == null;
    if (!(i < _vlength && i >= -_vlength)){ // not valid
      return;
    }
    if (i < 0){
      i = _vlength - (-i);
    }
    if (rm){ // rm
      this._vlength--;
      this.values.splice(i, 1);
    }else if (replace){ // replace
      this.values.splice(i, 1, row);
    }else{ // before or after
      this._vlength++;
      this.values.splice(i, 0, row);
    }
  }
  /**
   * @param {boolean} remove - Remove the row if the function returns true.
   * @param {function} fn - Function to be executed per row.
   * @description
   *
   * Modify rows by a function.
   *
   * ```js
   * // remove all rows since the third row
   * table.modifyRows(true, (row, i) => {
   *   return i >= 2;
   * })
   * // increment col2 from rows with col1 == "yes"
   * let idx = table.idx;
   * table.modifyRows(false, (row, i) => {
   *   return row[idx['col1']] === 'yes' ? row[idx['col2']]++ : null;
   * })
   * ```
   */
  modifyRows(remove, fn){
    let i=0;
    let _hlength = this._hlength;
    let values = this.values;
    let _vlength = this._vlength;

    let row = true;
    while (row){
      row = values[i];
      if (row){
        let nrow = fn(row, i);
        if (!remove){
          if (nrow != null && nrow.length === _hlength){ // leave unchanged
            values.splice(i, 1, nrow);
          }
          i++;
        }else if (nrow){ // true to be deleted
          values.splice(i, 1);
          _vlength--;
        }else{
          i++;
        }
      }
    }
    this._vlength = _vlength;
  }
  // can append, can set,
  // name has to be a string, values an array
  /**
   * @param {string} name - Header/Column name.
   * @param {col[]} values - Column values for every row in values.
   * @description
   *
   * Set column with values.
   *
   * ```js
   * let table = new FlexTable(["col1"], [[1], [2]]);
   * table.setColumn("col2", ["a", "b"]);
   * // table has headers ["col1", "col2"] and values [[1, "a"], [2, "b"]]
   * table.setColumn("col1", [-1, null]);
   * // table has headers ["col1", "col2"] and values [[-1, "a"], [null, "b"]]
   * table.setColumn("col1", null);
   * // table has headers ["col2"] and values [["a"], ["b"]]
   * ```
   */
  setColumn(name, values){
    let fn;
    if (typeof values === 'function'){
      fn = values;
    }
    if (Array.isArray(name)){
      return;
    }
    let headers = this.headers;
    if (!this.idx){
      this._setHeadersIndex();
    }
    let rm = values == null;
    let modify = true;
    let idx = this.idx;
    let pos = idx[name];
    if (rm){
      if (pos != null){
        this._hlength--;
        // delete idx[name];
        headers.splice(pos, 1);
        this._setHeadersIndex();
        idx = this.idx;
      }else{
        modify = false;
      }
    }else{
      if (pos == null){ // append
        pos = this._hlength;
        this._hlength++;
        // }else{ // replace
        // this._hlength++;
      }
      idx[name] = pos;
      headers.splice(pos, 1, name);
    }
    if (modify){
      let rows = this.values;
      let i=0;
      if (rm){
        for (let r of rows){
          r.splice(pos, 1);
        }
      }else{
        if (rows.length === 0 && values.length){
          for (let col of values){
            // special case
            let v = fn ? fn(col, [col], 0, name) : col;
            rows.push([v]);
          }
        }else if (!fn && rows.length !== values.length){
          // throw error
          return;
        }else{
          for (let r of rows){
            // name = column
            let v = fn ? fn(r[pos], r, i, name) : values[i];
            if (v != null){ // null means leave it unchanged
              r.splice(pos, 1, v);
            }
            i++;
          }
        }
      }
      if (!this._hlength){
        this.values = [];
      }
      this._setHeadersIndex();
    }
  }
  // names has to be a string[]
  // values has to be a [any[], ...]
  /**
   * @param {string[]} names - Header/Column names.
   * @param {col[][]} values - Column values for every row in values (an array per column).
   * @description
   *
   * Set columns with values.
   *
   * ```js
   * let table = new FlexTable(["col1"], [[1], [2]]);
   * table.setColumns(["col2", "col1"], [["a", "b"], null]);
   * // table has headers ["col2"] and values [["a"], ["b"]]
   * ```
   */
  setColumns(names, values){
    let len = names.length;
    if (values.length !== len){
      return;
    }
    let i = 0;
    while (i < len){
      this.setColumn(names[i], values[i]);
      i++;
    }
  }
  /**
   * @param {mapchain[]} mapchain - Sorting rules.
   * @description
   *
   * Sorts the values. It modifies the rows order in the table.
   *
   * ```js
   * let table = new FlexTable(["col1", "col2"], [[1, "a"], [2, "b"]]);
   * table.sort(['col1', '>num']);
   * // table has headers ["col1", "col2"] and values [[2, "b"], [1, "a"]]
   * table.sort(['col1', '<num']);
   * // table has headers ["col1", "col2"] and values [[1, "a"], [2, "b"]]
   *
   * table = new FlexTable(['ts', 'evname', 'time'],
   *   [
   *     [123, 'begin', 0.0],
   *     [123, 'start', 3.1],
   *     [123, 'end', 4.44],
   *     [124, 'begin', 0.0],
   *     [124, 'start', 2.5],
   *     [124, 'end', 4.1],
   *   ]);
   * let mapchain = [
   *  ['ts', function(a, b, i){ // like <num in this case
   *    let ai = a[i];
   *    let bi = b[i];
   *    let less = ai < bi;
   *    let eq = ai === bi;
   *    if (eq){
   *      return 0;
   *    }else{
   *      return less ? -1 : 1;
   *    }
   *  }],
   *  ['time', '>num'],
   * ];
   * // table has:
   * // {
   * //   headers: [ 'ts', 'evname', 'time' ],
   * //   values: [
   * //     [ 123, 'end', 4.44 ],
   * //     [ 123, 'start', 3.1 ],
   * //     [ 123, 'begin', 0 ],
   * //     [ 124, 'end', 4.1 ],
   * //     [ 124, 'start', 2.5 ],
   * //     [ 124, 'begin', 0 ]
   * //   ]
   * // }
   * ```
   */
  sort(mapchain){
    let idx = this.idx;
    if (!idx){
      this._setHeadersIndex();
      idx = this.idx;
    }
    if (mapchain.length){
      if (!Array.isArray(mapchain[0])){
        mapchain = [mapchain];
      }
    }
    let chain = chainHeaderToIdx(idx, mapchain);
    this.values.sort(function(a, b){
      return sortChain(a, b, chain);
    });
    this._setHeadersIndex();
  }
  /**
   * Clone the table headers and values. It instantiates a new table (by value).
   * @returns {Table} Cloned table instantiated.
   * @see FlexTable
   */
  clone(){
    let o = JSON.parse(JSON.stringify(this));
    let table = new FlexTable(o.headers, o.values);
    return table;
  }
  /**
   * @param {formatter} type - Formatter type.
   * @param {format} fmt - Format style.
   * @returns {string} Table formatted.
   * @description
   *
   * Format the table as a string.
   *
   * ```js
   * let table = new FlexTable(["a", "b", "c"], [[1.23, 1.02, "str"], [2, 2.335, ""]]);
   * let str = table.format('markdown', { header: '%s', float: '%.1f'});
   * // saves a markdown table in the variable. Every float value will be with 1 decimal.
   * console.log(table.format('md', { float: '%.1f', columns: [null, '%.2f', null]}));
   * // prints a markdown table. Every float is printed with 1 decimal, but the second column with 2 decimals.
   * console.log(table.format('csv');
   * // prints the table as CSV
   * ```
   */
  format(type, fmt){
    let ret;

    // fmt admits
    // "%.f" -> round to integer rounding
    // "%.5f" -> 5 decimals rounding
    // "%d" -> truncate to integer
    // "%s" -> string
    // "%10s" -> string padding
    // "%-10s" -> string padding left aligned
    //
    // [".4d", "d", "s"]
    // { header: "%s", float: "%.4f", integer: "%d", string: "%s" }, if missing, normal behavior
    // default fmt:
    // { header: "%-s", float: "%.5f", integer: "%d", string: "%-s" }
    fmt = formatter.parseFmt(fmt);

    switch(type){
    case 'md':
    case 'markdown':
      ret = formatter.printTableMarkdown(this, fmt);
      break;
    case 'csv':
      ret = formatter.printTableCSV(this, fmt);
      break;
    }
    return ret;
  }

}

/**
 * FlexTable module.
 * @module flextable
 */
module.exports = {
  /**
   * FlexTable version.
   */
  version: { major: 0, minor: 3, patch: 0 },
  /**
   * FlexTable class.
   */
  FlexTable,
  /**
   * FlexTable sorters (expose global sorting functions).
   */
  sorters,
};
