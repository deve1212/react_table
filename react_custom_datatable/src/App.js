    
import React, { Component } from 'react';
import './App.css';
import CustomTable from './Components/CustomTable';

export default class App extends Component {
  constructor(props) {
    super(props);

    let model = {
      headers: [
        {
          title: "joiningDate", accessor: "joiningDate", width: "80px", index: 1, cell: {
            type: "date",
            style: {
              "width": "50px",
            }
          }
        },
        { title: "Name", accessor: "name", width: "300px", index: 2, dataType: "string" },
        { title: "year", accessor: "year", index: 3, dataType: "number" },
        { title: "skills", accessor: "skills", index: 4, dataType: "number" },
        {
          title: "Rating", accessor: "rating", index: 5, width: "200px", cell: row => (
            <div>
              <div style={{
                backgroundColor: "lightskyblue",
                textAlign: "center",
                height: "1.9em",
                width: (row.rating / 5) * 201 + "px",
                margin: "3px 0 4px 0"
              }}><a href={`/showchart/${row.id}`}>{row.rating}</a></div>
            </div>
          )
        },
      ],
      data: [
        { id: 1, name: "a", year: 1996, skills: "cs", rating: 3, joiningDate: "2018-07-22" },
        { id: 2, name: "b", year: 1992, skills: "react", rating: 5, joiningDate: "2018-12-22" },
        { id: 3, name: "c", year: 2008, skills: "js", rating: 3, joiningDate: "2018-07-22" },

        { id: 12, name: "a", year: 1996, skills: "cs", rating: 3, joiningDate: "2018-07-22" },
        { id: 23, name: "b", year: 1992, skills: "react", rating: 5, joiningDate: "2018-12-22" },
        { id: 333, name: "c", year: 2008, skills: "js", rating: 3, joiningDate: "2018-07-22" },

        { id: 211, name: "a", year: 1996, skills: "cs", rating: 3, joiningDate: "2018-07-22" },
        { id: 212, name: "b", year: 1992, skills: "react", rating: 5, joiningDate: "2018-12-22" },
        { id: 1233, name: "c", year: 2008, skills: "js", rating: 3, joiningDate: "2018-07-22" },

        { id: 12131, name: "a", year: 1996, skills: "cs", rating: 3, joiningDate: "2018-07-22" },
        { id: 123132, name: "b", year: 1992, skills: "react", rating: 5, joiningDate: "2018-12-22" },
        { id: 131323, name: "c", year: 2008, skills: "js", rating: 3, joiningDate: "2018-07-22" },

        { id: 1123123, name: "a", year: 1996, skills: "cs", rating: 3, joiningDate: "2018-07-22" },
        { id: 12312, name: "b", year: 1992, skills: "react", rating: 5, joiningDate: "2018-12-22" },
        { id: 131233, name: "c", year: 2008, skills: "js", rating: 3, joiningDate: "2018-07-22" },
      ]
    }

    for (var i = 4; i <= 20; i++) {
      model.data.push({
        id: i,
        name: "name " + i,
        year: i + 18,
        skills: "Node",
        rating: (i % 2 ? 3 : 4),
        joiningDate: "2018-07-22"
      })
    }

    this.state = model;

  }


  onUpdateTable = (field, id, value) => {
    let data = this.state.data.slice();
    let updateRow = this.state.data.find((d) => {
      return d["id"] == id;
    });

    updateRow[field] = value;

    this.setState({
      edit: null,
      data: data
    });
  }

  render() {
    return (
      <div>
       
        <CustomTable
          title="USER SKill Data"
          keyField="id"
          edit={true}
          pagination={{
            enabled: true,
            pyearLength: 5,
            type: "long"  // long, short
          }}
          width="100%"
          headers={this.state.headers}
          data={this.state.data}
          noData="No records!"
          onUpdate={this.onUpdateTable} />
      </div>
    );
  }
}
