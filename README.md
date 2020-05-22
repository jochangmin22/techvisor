# 설치방법

-   아마콘다 가상환경 python 3.6.10 (tensorflow를 위해 3.6대 유지)
-   django
-   django rest framework
-   react

## 아나콘다 환경

    확인
      conda info --envs
    삭제
      conda remove --name [name] --all
    설치
      conda create -n [name] python=3.6.8
    캐시 삭제
      conda clean --all
    콘다 버전업
      conda update -n root conda

## DJANGO 설치

<pre><code>
pip install django
pip install djangorestframework
cd d:
cd /github/ipgrim
django-admin startproject ipgrim
mv ipgrim src
</code></pre>

-   링크 1 : [django link](https://www.djangoproject.com/)
-   링크 2 : [django rest framework link](https://www.django-rest-framework.org/)

## VSCODE 셋팅

-   [참조 사이트 1](https://youtu.be/-nh9rCzPJ20)
-   [참조 사이트 2](https://github.com/CoreyMSchafer/dotfiles/blob/master/settings/VSCode-Settings.json)

#### settings.json에 아래 추가

<pre><code>
    "workbench.colorTheme": "Predawn",
    "workbench.iconTheme": "ayu",
    "workbench.settings.editor": "json",
    "workbench.settings.openDefaultSettings": true,
    "workbench.settings.useSplitJSON": true,
    "python.pythonPath": "C:\\Users\\betowin\\Anaconda3\\envs\\ipgrim\\python.exe",
</code></pre>

#### pythonpath 경로아는법 conda 환경에서

<pre><code>
  python
  import sys
  sys.executable
</code></pre>

#### python 문법 체크 설치

<pre><code>
pip install pylint
</code></pre>

#### vscode extention 설치

-   Code Runner

#### package.json script 실행에 필요

<pre><code>
npm install copyfiles -g
npm install -g renamer
</code></pre>

#### webpect 4 설치 (보류: 그냥 fuse react 테마는 react-scripts 쓰는 걸로

##### webpack이 에러없이 성공하였으나 build, dist, index.html 파일이 생성안됨 (19.08.16)

<pre><code>
yarn add --dev webpack webpack-cli webpack-merge webpack-dev-server style-loader css-loader file-loader html-loader ts-loader html-webpack-plugin mini-css-extract-plugin node-sass optimize-css-assets-webpack-plugin sass-loader url-loader @babel/core babel-loader @babel/preset-env @babel/preset-react @babel/plugin-proposal-class-properties

yarn add clean-webpack-plugin
</code></pre>

## REACT 설치

-   Fuse-React-v3.2.3-skeleton.zip 폴더를 작업폴더에 풀고 <code>yarn
    </code> 실행

## DJANGO PostgresSQL 설치

conda 환경에서 설치

settings.py에 DATABASES 수정 sqlite3 -> postgresql

<pre><code>
(ipgrim) $ conda install psycopg2
</code></pre>
