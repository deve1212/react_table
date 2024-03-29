import React from 'react';
import ReactDOM from 'react-dom';
import './CustomTable.css';
import { PropTypes } from 'prop-types';
import Pagination from '../Paginate';

export default class CustomTable extends React.Component {
    jsonData = null

    constructor(props) {
        super(props);

        this.state = {
            headers: props.headers,
            data: props.data,
            pagedData: props.data,
            sortby: null,
            descending: null,
            search: false,
            pageLength: this.props.pagination.pageLength || 2,
            currentPage: 1,
        }

        this.keyField = props.keyField || "id"; // uniq identifer for colmn
        this.noData = props.noData || "No records found!"; //if no data in table
        this.width = props.width || "100%";

        // Adding pagination
        this.pagination = this.props.pagination || {};
    }

    tableHeader = () => {
        let { headers } = this.state;
        headers.sort((a, b) => {
            if (a.index > b.index) return 1;
            return -1;
        });

        let headerView = headers.map((header, index) => {
            let title = header.title;
            let cleanTitle = header.accessor;
            let width = header.width;

            if (this.state.sortby === index) {
                title += this.state.descending ? '\u2193' : '\u2191';
            }

            return (
                <th key={cleanTitle}
                    style={{ width: width }}
                    data-col={cleanTitle}>
                    <span draggable data-col={cleanTitle} >
                        {title}
                    </span>
                </th>
            );
        });

        return headerView;
    }

    renderNoData = () => {
        return (
            <tr>
                <td colSpan={this.props.headers.length}>
                    {this.noData}
                </td>
            </tr>
        );
    }

    onUpdate = (e) => {
        e.preventDefault();
        let input = e.target.firstChild;
        let header = this.state.headers[this.state.edit.cell];
        let rowId = this.state.edit.rowId;

        this.setState({
            edit: null
        });

        this.props.onUpdate &&
            this.props.onUpdate(header.accessor, rowId, input.value);
    }


    renderContent = () => {
        let { headers } = this.state;
        let data = this.pagination ? this.state.pagedData
            : this.state.data;

        let contentView = data.map((row, rowIdx) => {
            let id = row[this.keyField];
            let edit = this.state.edit;

            let tds = headers.map((header, index) => {
                let content = row[header.accessor];
                let cell = header.cell;
                if (cell) {
                    if (typeof (cell) === "object") {
                        if (cell.type === "date" && content) {
                            let get_date = new Date(content)
                            if (get_date.toString() === 'Invalid Date')
                                content =  <input name={id}  type="date" />
                            else
                                {  
                                    let data = get_date
                                    let formatted_date = data.getFullYear().toString()+'-' + ('0'+(data.getMonth()+1).toString()).slice(-2)+'-' +('0'+data.getDate().toString()).slice(-2)
                                    content =  <input name={id} defaultValue={formatted_date} type="date" />
                                }
                        }
                    } else if (typeof (cell) === "function") {
                        content = cell(row);
                    }
                }

                if (this.props.edit) {
                    if (header.dataType && (header.dataType === "number" ||
                        header.dataType === "string") &&
                        header.accessor !== this.keyField) {
                        if (edit && edit.row === rowIdx && edit.cell === index) {
                            content = (
                                <form onSubmit={this.onUpdate}>
                                    <input type="text" defaultValue={content}
                                       />
                                </form>
                            );
                        }

                    }
                }

                return (
                    <td key={index} data-id={id} data-row={rowIdx}>
                        {content}
                    </td>
                );
            });
            return (
                <tr key={rowIdx}>
                    {tds}
                </tr>
            );
        });
        return contentView;
    }

    onSort = (e) => {
        let data = this.state.data.slice();
        let colIndex = ReactDOM.findDOMNode(e.target).parentNode.cellIndex;
        let colTitle = e.target.dataset.col;

        let descending = !this.state.descending;

        data.sort((a, b) => {
            let sortVal = 0;
            if (a[colTitle] < b[colTitle]) {
                sortVal = -1;
            } else if (a[colTitle] > b[colTitle]) {
                sortVal = 1;
            }
            if (descending) {
                sortVal = sortVal * -1;
            }
            return sortVal;
        });

        this.setState({
            data,
            sortby: colIndex,
            descending
        }, () => {
            this.onGotoPage(this.state.currentPage);
        });
    }

    onSearch = (e) => {
        let { headers } = this.state;
        // Grab the index of the target column
        let idx = e.target.dataset.idx;

        // Get the target column
        let targetCol = this.state.headers[idx].accessor;

        let data = this.jsonData;

        // Filter the records
        let searchData = this.jsonData.filter((row) => {
            let show = true;

            for (let i = 0; i < headers.length; i++) {
                let fieldName = headers[i].accessor;
                let fieldValue = row[fieldName];
                let inputId = 'inp' + fieldName;
                let input = this[inputId];
                if (!fieldValue === '') {
                    show = true;
                } else {
                    show = fieldValue.toString().toLowerCase().indexOf(input.value.toLowerCase()) > -1;
                    if (!show) break;
                }
            }
            return show;
        });

        // UPdate the state
        this.setState({
            data: searchData,
            pagedData: searchData,
            totalRecords: searchData.length
        }, () => {
            if (this.pagination.enabled) {
                this.onGotoPage(1);
            }
        });
    }

    renderSearch = () => {
        let { search, headers } = this.state;
        if (!search) {
            return null;
        }

        let searchInputs = headers.map((header, idx) => {

            // Get the header ref.
            let hdr = this[header.accessor];
            let inputId = 'inp' + header.accessor;

            return (
                <td key={idx}>
                    <input type="text"
                        ref={(input) => this[inputId] = input}
                        style={{
                            width: hdr.clientWidth - 17 + "px"
                        }}
                        data-idx={idx}
                    />
                </td>
            );

        });

        return (
            <tr onChange={this.onSearch}>
                {searchInputs}
            </tr>
        );
    }

    onShowEditor = (e) => {
        let id = e.target.dataset.id;
        this.setState({
            edit: {
                row: parseInt(e.target.dataset.row, 10),
                rowId: id,
                cell: e.target.cellIndex
            }
        })
    }

    getTable = () => {
        let title = this.props.title || "CustomTable";
        let headerView = this.tableHeader();
        let contentView = this.state.data.length > 0
            ? this.renderContent()
            : this.renderNoData();

        return (
            <table>
                <caption>
                    {title}
                </caption>
                <thead onClick={this.onSort}>
                    <tr>
                        {headerView}
                    </tr>
                </thead>
                <tbody onDoubleClick={this.onShowEditor}>
                    {this.renderSearch()}
                    {contentView}
                </tbody>
            </table>
        );
    }

    onToggleSearch = (e) => {
        if (this.state.search) {
            this.setState({
                data: this.jsonData,
                search: false
            });
            this.jsonData = null;
        } else {
            this.jsonData = this.state.data;
            this.setState({
                search: true
            });
        }
    }

    getPagedData = (pageNo, pageLength) => {
        let startOfRecord = (pageNo - 1) * pageLength;
        let endOfRecord = startOfRecord + pageLength;

        let data = this.state.data;
        let pagedData = data.slice(startOfRecord, endOfRecord);

        return pagedData;
    }

    onPageLengthChange = (pageLength) => {
        this.setState({
            pageLength: parseInt(pageLength, 10)
        }, () => {
            this.onGotoPage(this.state.currentPage);
        });
    }

    onGotoPage = (pageNo) => {
        let pagedData = this.getPagedData(pageNo, this.state.pageLength);
        this.setState({
            pagedData: pagedData,
            currentPage: pageNo
        });
    }

    componentDidMount() {
        if (this.pagination.enabled) {
            this.onGotoPage(this.state.currentPage);
        }
    }


    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.data.length != prevState.data.length) {
            return {
                headers: nextProps.headers,
                data: nextProps.data,
                sortby: prevState.sortby,
                descending: prevState.descending,
                search: prevState.search,
                currentPage: 1,
                pagedData: nextProps.data,
            }
        }
        return null;
    }

    render() {
        return (
            <div className={this.props.className}>
                {this.pagination.enabled &&

                    <Pagination
                        type={this.props.pagination.type}
                        totalRecords={this.state.data.length}
                        pageLength={this.state.pageLength}
                        onPageLengthChange={this.onPageLengthChange}
                        onGotoPage={this.onGotoPage}
                        currentPage={this.state.currentPage}
                    />
                }
                {this.getTable()}
            </div>
        )
    }
}

CustomTable.propTypes = {
  data: PropTypes.array,
  header: PropTypes.object,
  pagination:PropTypes.object,
  keyField:PropTypes.string,
  noData:PropTypes.string,
  width:PropTypes.string
};
