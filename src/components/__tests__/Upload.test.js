import React from 'react';
import {shallow} from 'enzyme';
import Upload from '../Upload.react';

describe('Upload', () => {

    it('renders', () => {
        const component = shallow(<Upload id="test"/>);
        expect(component).to.be.ok;
    });
});
