from flask import request as _request
from flask import abort as _abort
import os as _os
import shutil as _shutil
import dash as _dash
import sys as _sys
import time as _time
from .version import __version__

_current_path = _os.path.dirname(_os.path.abspath(__file__))

_components = _dash.development.component_loader.load_components(
    _os.path.join(_current_path, 'metadata.json'),
    'dash_resumable_upload'
)

_this_module = _sys.modules[__name__]


_js_dist = [
    {
        "relative_package_path": "bundle.js",
        "external_url": (
            "https://unpkg.com/dash-resumable-upload@{}"
            "/dash_resumable_upload/bundle.js"
        ).format(__version__),
        "namespace": "dash_resumable_upload"
    }
]

_css_dist = []


for _component in _components:
    setattr(_this_module, _component.__name__, _component)
    setattr(_component, '_js_dist', _js_dist)
    setattr(_component, '_css_dist', _css_dist)


def decorate_server(server, temp_base):
    # resumable.js uses a GET request to check if it uploaded the file already.
    # NOTE: your validation here needs to match whatever you do in the POST
    # (otherwise it will NEVER find the files)
    @server.route("/upload_resumable", methods=['GET'])
    def resumable():
        resumableIdentfier = _request.args.get('resumableIdentifier', type=str)
        resumableFilename = _request.args.get('resumableFilename', type=str)
        resumableChunkNumber = _request.args.get('resumableChunkNumber',
                                                 type=int)

        if not (resumableIdentfier
                and resumableFilename
                and resumableChunkNumber):
            # Parameters are missing or invalid
            _abort(500, 'Parameter error')

        # chunk folder path based on the parameters
        temp_dir = _os.path.join(temp_base, resumableIdentfier)

        # chunk path based on the parameters
        chunk_file = _os.path.join(
            temp_dir,
            get_chunk_name(resumableFilename, resumableChunkNumber)
        )
        server.logger.debug('Getting chunk: %s', chunk_file)

        if _os.path.isfile(chunk_file):
            # Let resumable.js know this chunk already exists
            return 'OK'
        else:
            # Let resumable.js know this chunk does not exists
            # and needs to be uploaded
            _abort(404, 'Not found')

    # if it didn't already upload, resumable.js sends the file here
    @server.route("/upload_resumable", methods=['POST'])
    def resumable_post():
        resumableTotalChunks = _request.form.get('resumableTotalChunks',
                                                 type=int)
        resumableChunkNumber = _request.form.get('resumableChunkNumber',
                                                 default=1, type=int)
        resumableFilename = _request.form.get('resumableFilename',
                                              default='error', type=str)
        resumableIdentfier = _request.form.get('resumableIdentifier',
                                               default='error', type=str)

        # get the chunk data
        chunk_data = _request.files['file']

        # make our temp directory
        temp_dir = _os.path.join(temp_base, resumableIdentfier)
        if not _os.path.isdir(temp_dir):
            _os.makedirs(temp_dir)

        # save the chunk data
        chunk_name = get_chunk_name(resumableFilename, resumableChunkNumber)
        chunk_file = _os.path.join(temp_dir, chunk_name)

        # make a lock file
        lock_file_path = _os.path.join(
            temp_dir,
            '.lock_{:d}'.format(resumableChunkNumber)
        )

        with open(lock_file_path, 'a'):
            _os.utime(lock_file_path, None)
        chunk_data.save(chunk_file)
        server.logger.debug('Saved chunk: %s', chunk_file)
        _os.unlink(lock_file_path)

        # check if the upload is complete
        chunk_paths = [
            _os.path.join(temp_dir, get_chunk_name(resumableFilename, x))
            for x in range(1, resumableTotalChunks+1)
        ]
        upload_complete = all([_os.path.exists(p) for p in chunk_paths])

        # combine all the chunks to create the final file
        if upload_complete:
            # Make sure all files are finished writing
            while any([_os.path.isfile(
                      _os.path.join(temp_dir, '.lock_{:d}'.format(chunk))
                      ) for chunk in range(1, resumableTotalChunks + 1)]):
                    _time.sleep(1)
            # Make sure some other chunk didn't trigger file reconstruction
            target_file_name = _os.path.join(temp_base, resumableFilename)
            if not _os.path.exists(target_file_name):
                with open(target_file_name, "ab") as target_file:
                    for p in chunk_paths:
                        with open(p, 'rb') as stored_chunk_file:
                            target_file.write(stored_chunk_file.read())
                server.logger.debug('File saved to: %s', target_file_name)
                _shutil.rmtree(temp_dir)

        return resumableFilename


def get_chunk_name(uploaded_filename, chunk_number):
    return uploaded_filename + "_part_%03d" % chunk_number
