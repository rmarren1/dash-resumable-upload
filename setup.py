from setuptools import setup

exec (open('dash_resumable_upload/version.py').read())

setup(
    name='dash_resumable_upload',
    version=__version__,
    author='marrenr',
    packages=['dash_resumable_upload'],
    include_package_data=True,
    license='MIT',
    description='Dash Resumable Upload component for large files.',
    install_requires=[]
)
