## project setup
* 初始化 npm install && bower install

* gulp serve  调试

* gulp serve:dist  打包后的试运行

* gulp build 打包

* 发布svn: sh svn.sh

* 服务器发布：svn export svn://192.168.1.40/MSI-FE/h5/nono/sale-template /usr/share/nginx/www/trunk/h5/nono/sale-template --force


## bower
使用`bower`来管理第三方库依赖  

* install  

	~~~
	npm install bower -g
	~~~
* usage(以添加zepto为例)
	
	~~~
	bower install zepto --save
	~~~

### cnpm
npm的国内淘宝镜像，可用于替换npm的操作，提升下载速度

* install

	~~~
	npm install -g cnpm --registry=https://registry.npm.taobao.org
	~~~
