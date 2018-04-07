import React, {Component} from 'react';
import {Upload} from '../src';

class Demo extends Component {
    constructor() {
        super();
        this.state = {
            value: ''
        }
    }

    render() {
        return (
            <div>
                <h1>dash-resumable-upload Demo</h1>

                <hr/>
                <h2>Upload</h2>
                <Upload
                    id="test"
                />
                <hr/>
            </div>
        );
    }
}

export default Demo;
