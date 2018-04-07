import React, {Component, PropTypes} from 'react';
import Resumablejs from 'resumablejs';

export default class Upload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progressBar: 0,
            messageStatus: '',
            fileList: {files: []},
            isPaused: false,
            isUploading: false,
            isHovered: false,
            isComplete: false
        };
        this.toggleHovered = this.toggleHovered.bind(this)
        this.cancelUpload = this.cancelUpload.bind(this)
        this.pauseUpload = this.pauseUpload.bind(this)
        this.startUpload = this.startUpload.bind(this)
        this.resumable = null;
    }

    componentDidMount() {

        const ResumableField = new Resumablejs({
            target: this.props.service,
            query: {},
            fileType: this.props.filetypes,
            maxFiles: this.props.maxFiles,
            maxFileSize: this.props.maxFileSize,
            fileTypeErrorCallback: () => {
                this.setState({
                    messageStatus: 'Invalid file type!'
                });
            },
            testMethod: 'post',
            testChunks: false,
            headers: {},
            chunkSize: this.props.chunkSize,
            simultaneousUploads: this.props.simultaneousUploads,
            forceChunkSize: false
        });

        ResumableField.assignBrowse(this.uploader);

        //Enable or Disable DragAnd Drop
        if (this.props.disableDragAndDrop === false) {
            ResumableField.assignDrop(this.dropZone);
        }

        ResumableField.on('fileAdded', (file) => {
            this.setState({
                messageStatus: this.props.fileAddedMessage || ' Starting upload! of ' + file.fileName,
                isComplete: false
            });

             if (typeof this.props.onFileAdded === 'function') {
                 this.props.onFileAdded(file, this.resumable);
             } else {
                 ResumableField.upload();
             }
        });

        ResumableField.on('fileSuccess', (file, fileServer) => {

            if (this.props.fileNameServer) {
                let objectServer = JSON.parse(fileServer);
                file.fileName = objectServer[this.props.fileNameServer];
            } else {
                file.fileName = fileServer;
            }
            let currentFiles = this.state.fileList.files;
            currentFiles.push(file);

            let fileNames = this.props.fileNames
            fileNames.push(file.fileName);

            if (this.props.setProps) {
                this.props.setProps({
                      fileNames: fileNames
                });
            }
            this.setState({
                fileList: {files: currentFiles},
                isComplete: true,
                messageStatus: this.props.completedMessage + file.fileName || fileServer
            }, () => {
                if (typeof this.props.onFileSuccess === 'function') {
                    this.props.onFileSuccess(file, fileServer);
                }
            });
        });

        ResumableField.on('progress', () => {


            this.setState({
                isUploading: ResumableField.isUploading()
            });

            if ((ResumableField.progress() * 100) < 100) {
                this.setState({
                    messageStatus: parseInt(ResumableField.progress() * 100, 10) + '%',
                    progressBar: ResumableField.progress() * 100
                });
            } else {
                setTimeout(() => {
                    this.setState({
                        progressBar: 0
                    })
                }, 1000);
            }

        });

        ResumableField.on('fileError', (file, errorCount) => {
            this.props.onUploadErrorCallback(file, errorCount);
        });

        this.resumable = ResumableField;
    }

    cancelUpload() {
        this.resumable.cancel();

        this.setState({
            fileList: {files: []}
        });
    }

    pauseUpload() {
        if (!this.state.isPaused) {
            this.resumable.pause();
            this.setState({
                isPaused: true,
                isUploading: true
            });
        } else {
            this.resumable.upload();
            this.setState({
                isPaused: false,
                isUploading: true
            });
        }
    }

    startUpload() {
        this.setState({
            isPaused: false
        });
    }

    toggleHovered() {
        this.setState({
            isHovered: !this.state.isHovered
        })
    }

    render() {

        let fileList = null;

        let textLabel = null;
        if (this.props.textLabel) {
            textLabel = this.props.textLabel;
        }

        let startButton = null;
        if (this.props.startButton) {
            if (typeof this.props.startButton ==='string' || typeof this.props.startButton ==='boolean' ) startButton = <label>
                <button
                  disabled={this.state.isUploading}
                  className="resumable-btn-start"
                  onClick={this.startUpload}>{this.props.startButton && 'upload'}
                </button>
            </label>;
            else startButton =this.props.startButton
        }

        let cancelButton = null;
        if (this.props.cancelButton) {
            if (typeof this.props.cancelButton ===  'string' ||
                typeof this.props.cancelButton ===  'boolean') cancelButton = <label>
                <button
                  disabled={!this.state.isUploading}
                  className="resumable-btn-cancel"
                  onClick={this.cancelUpload}>{this.props.cancelButton && 'cancel'}
                </button>
            </label>;
            else cancelButton = this.props.cancelButton
        }

        let pauseButton = null;
        if (this.props.pauseButton) {
            if (typeof this.props.pauseButton ===  'string'
                || typeof this.props.pauseButton ===  'boolean') pauseButton = <label>
                <button
                  disabled={!this.state.isUploading}
                  className="resumable-btn-pause"
                  onClick={this.pauseUpload}>
                  {this.props.pauseButton
                   && (this.state.isPaused ? 'resume' : 'pause')}
                </button>
            </label>;
            else pauseButton = this.props.pauseButton
        }

        let getStyle = () => {
            if (this.state.isComplete) {
                return this.props.completeStyle;
            } else if (this.state.isHovered || this.state.isUploading) {
                return this.props.activeStyle;
            } else {
                return this.props.defaultStyle;
            }
        }

        let getClass = () => {
            if (this.props.disabledInput) {
              return this.props.disableClass;
            } else if (this.state.isHovered) {
              return this.props.hoveredClass;
            } else if (this.state.isUploading) {
              return this.props.uploadingClass;
            } else if (this.state.isComplete) {
              return this.props.completeClass;
            } else if (this.state.isPaused) {
              return this.props.completeClass;
            } else {
              return this.props.className
            }
        }

        return (
            <div id={this.props.id} className={getClass()} ref={node => this.dropZone = node} >
                <label
                       style={getStyle()}
                       onMouseEnter={this.toggleHovered}
                       onMouseLeave={this.toggleHovered}
                       >
                         {this.state.messageStatus == '' ? textLabel : this.state.messageStatus}
                    <input
                        ref={node=> this.uploader = node}
                        type="file"
                        className='btn'
                        name={this.props.id + '-upload'}
                        accept={this.props.fileAccept || '*'}
                        disabled={this.props.disableInput || false}
                        style={{'opacity': '0',
                                'width': '0.1px%',
                                'height': '0.1px%',
                                'position': 'absolute',
                                'overflow': 'hidden',
                                'z-index': '-1'}}
                    />
                </label>
                <div className="progress"
                     style={{
                       display: this.state.progressBar === 0 ? 'none' : 'block'
                     }}>
                    <div className="progress-bar"
                         style={{
                           width: this.state.progressBar + '%',
                           height: '100%'
                         }}></div>
                    </div>
                {fileList}
                {startButton}
                {pauseButton}
                {cancelButton}
            </div>
        );
    }
}

Upload.propTypes = {
    /**
     * Maximum number of files that can be uploaded in one session
     */
    maxFiles: PropTypes.number,

    /**
     * Maximum size per file in bytes.
     */
    maxFileSize: PropTypes.number,

    /**
     * Size of file chunks to send to server.
     */
    chunkSize: PropTypes.number,

    /**
     * Number of simultaneous uploads to select
     */
    simultaneousUploads: PropTypes.number,

    /**
     * The service to send the files to
     */
    service: PropTypes.string,

    /**
     * Class to add to the upload component by default
     */
    className: PropTypes.string,

    /**
     * Class to add to the upload component when it is hovered
     */
    hoveredClass: PropTypes.string,

    /**
     * Class to add to the upload component when it is disabled
     */
    disabledClass: PropTypes.string,

    /**
     * Class to add to the upload component when it is paused
     */
    pausedClass: PropTypes.string,

    /**
     * Class to add to the upload component when it is complete
     */
    completeClass: PropTypes.string,

    /**
     * Class to add to the upload component when it is uploading
     */
    uploadingClass: PropTypes.string,

    /**
     * Style attributes to add to the upload component
     */
    defaultStyle: PropTypes.object,

    /**
     * Style when upload component is hovered over
     */
    activeStyle: PropTypes.object,

   /**
    * Style when upload is completed (upload finished)
    */
    completeStyle: PropTypes.object,

    /**
     * The string to display in the upload component
     */
    textLabel: PropTypes.string,

    /**
     * Message to display when upload completed
     */
    completedMessage: PropTypes.string,

    /**
     * The names of the files uploaded
     */
    fileNames: PropTypes.arrayOf(PropTypes.string),

    /**
     * List of allowed file types, e.g. ['jpg', 'png']
     */
    filetypes: PropTypes.arrayOf(PropTypes.string),

    /**
     * Whether or not to have a start button
     */
    startButton: PropTypes.bool,

    /**
     * Whether or not to have a pause button
     */
    pauseButton: PropTypes.bool,

    /**
     * Whether or not to have a cancel button
     */
    cancelButton: PropTypes.bool,

    /**
     * Whether or not to allow file drag and drop
     */
    disableDragAndDrop: PropTypes.bool,

    /**
     * Dash-supplied function for updating props
     */
    setProps: PropTypes.func,

    /**
     * User supplied id of this component
     */
    id: PropTypes.string

}

Upload.defaultProps = {
    maxFiles: 1,
    maxFileSize: 1024 * 1024 * 10,
    chunkSize: 1024 * 1024,
    simultaneuosUploads: 1,
    service: '/upload',
    className: 'resumable-default',
    hoveredClass: 'resumable-hovered',
    completeClass: 'resumable-complete',
    disabledClass: 'resumable-disabled',
    pausedClass: 'resumable-paused',
    uploadingClass: 'resumable-uploading',
    defaultStyle: {},
    activeStyle: {},
    completeStyle: {},
    textLabel: 'Click Here to Select a File',
    completedMessage: 'Complete! ',
    fileNames: [],
    filetypes: undefined,
    startButton: true,
    pauseButton: true,
    cancelButton: true,
    disableDragAndDrop: false,
    id: 'default-uploader-id'
};
