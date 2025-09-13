from setuptools import setup, find_packages

setup(
    name="digital-literacy-platform",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        'fastapi==0.104.1',
        'uvicorn[standard]==0.24.0',
        'SQLAlchemy==2.0.23',
        'alembic==1.12.1',
        'python-jose[cryptography]==3.3.0',
        'passlib[bcrypt]==1.7.4',
        'python-multipart==0.0.6',
        'email-validator==2.1.0',
        'python-dotenv==1.0.0',
        'psycopg2-binary==2.9.9',
        'pydantic[email]==2.5.1',
        'pytest==7.4.3',
        'httpx==0.25.1',
        'aiofiles==23.2.1',
        'pydantic-settings==2.1.0'
    ],
    dependency_links=[
        'https://download.pytorch.org/whl/torch_stable.html'
    ]
)
