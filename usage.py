import dash_resumable_upload
import dash
import dash_html_components as html
from dash.dependencies import Input, Output
import base64

app = dash.Dash('')

dash_resumable_upload.decorate_server(app.server, "uploads")

app.scripts.config.serve_locally = True

app.css.append_css({
    "external_url": "https://codepen.io/rmarren1/pen/eMQKBW.css"
})

app.layout = html.Div([
    dash_resumable_upload.Upload(
        id='upload',
        maxFiles=1,
        maxFileSize=1024*1024*1000,  # 100 MB
        service="/upload_resumable",
        textLabel="Drag and Drop Here to upload!",
        startButton=False
    ),
    html.Div(id='output')
])


def get_img(x):
    return x
    #encode = base64.b64encode(
    #    open("uploads/%s" % (x), 'rb').read()).decode('ascii')
    #return "data:image/jpg;base64,{}".format(encode)


@app.callback(Output('output', 'children'),
              [Input('upload', 'fileNames')])
def display_files(fileNames):
    if fileNames is not None:
        return html.Ul([html.Li(
            html.Img(height="50", width="100", src=get_img(x))) for x in fileNames])
    return html.Ul(html.Li("No Files Uploaded Yet!"))


if __name__ == '__main__':
    app.run_server(debug=True)
