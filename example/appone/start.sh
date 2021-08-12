#!/bin/bash

# 代码路径
basedir=$(cd $(dirname $0);pwd)

# 指定配置文件路径
node dsf-client/index.js $basedir/conf.js

