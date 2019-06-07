import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import Upload from '../Upload.react';

describe('Upload', () => {


    it('renders', () => {
        const renderer = new ShallowRenderer();
        renderer.render(<Upload id="test"/>);
        const component = renderer.getRenderOutput();
        expect(component).to.be.ok;
    });
});
