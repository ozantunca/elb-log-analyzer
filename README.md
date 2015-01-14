# Log Analyzer for AWS Elastic Load Balancer
ELB log analyzer is command line tool for parsing Elastic Load Balancer's access logs and getting quick statistics. Useful for detecting requests taking longest time, IP's making most requests and many other data that can be derived from log files.


## Installation
```sh
	npm install -g elb-log-analyzer
```

## Usage
Log analyzer receives input as directories or files. It reads those log files and returns a table-like two column data set. 

Assuming we have a directory structure like below...
```
	.
	└── logs/
	      ├── access-log1.txt
          ├── access-log2.txt
          ├── access-log3.txt
```
You can specify a log file to be analyzed like this:
```sh
	elb-log-analyzer logs/access-log1.txt
```
or you can specify several of them:

```sh
	elb-log-analyzer logs/access-log1.txt logs/access-log2.txt
```
or you can simply specify the **directory**:

```sh
	elb-log-analyzer logs/
```

By default log analyzer will count all requests and sort them in descending order so that most requested URLs will be listed. This functionality can be changed  but this one was chosen as default behaviour since it appears to be the most common case. Example output:
```sh
1 - 930: http://onedio.com:80/img/user/000000000000000000000000
2 - 827: http://onedio.com:80/images/trans.png
3 - 690: http://onedio.com:80/stylesheets/external/font-awesome.css
4 - 670: http://onedio.com:80/images/logo/onedio-new2x.png
5 - 633: http://onedio.com:80/
6 - 404: http://onedio.com:80/images/logo/onedio-o-logo.png
7 - 398: http://onedio.com:80/images/icon/article-comment-onedio.png
8 - 355: http://onedio.com:80/favicons/favicon-32x32.png
9 - 341: http://onedio.com:80/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3
10 - 327: http://www.onedio.com:80/favicon.ico
```
Values in columns can be set to any of the values in logs files which can be seen here http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/access-log-collection.html#access-log-entry-format. There are total of 3 extra fields added to these which are `count`, `total_time` and `requested_resource`. When `count` is specified, it serves as a **groupBy** method that counts values in the other column and groups them together. Note that column1 is `count` by default. `total_time` is obtained by summing up `request_processing_time`, `backend_processing_time` and `response_processing_time`. `requested_resource` is a URL obtained by parsing `request` field. `requested_resource` is column2 by default.

Columns can be changed like this:
```sh
	elb-log-analyzer logs/ --col2=client:port
```
We get client IPs that make requests the most. Example output:
```
1 - 258: 54.239.167.77:6176
2 - 246: 54.239.167.77:48034
3 - 246: 54.239.167.77:4901
4 - 245: 54.239.167.77:63220
5 - 240: 54.239.167.77:54719
6 - 231: 54.239.167.77:59174
7 - 230: 54.239.167.77:23953
8 - 221: 54.239.167.77:23955
9 - 220: 54.239.167.77:29415
10 - 220: 54.239.167.77:62824
```

Another example: below code gets clients that make requests which takes the longest time in total.
```sh
	elb-log-analyzer logs/ --col1=total_time --col2=client:port
```
Example output:
```
1 - 3.153657: 188.57.145.98:11668
2 - 2.5415739999999998: 85.103.48.224:59350
3 - 2.406679: 78.167.150.108:40395
4 - 2.406679: 78.167.150.108:40395
5 - 1.8946479999999999: 195.175.206.174:51253
6 - 1.8946479999999999: 195.175.206.174:51253
7 - 1.543733: 54.239.167.77:23955
8 - 1.543733: 54.239.167.77:23955
9 - 1.495889: 213.144.123.242:50561
10 - 1.495889: 213.144.123.242:50561
```

#### Prefixing
A string can be provided to get values that starts with given string. This can be done using `--prefix1` and/or `--prefix2` options depending the column that needs to be queried. For example this feature can be used to get number of resources requested starting with certain URL. The command that performs this action would be similar to the one below:
```sh
	elb-log-analyzer logs/ --col1=count --col2=requested_resource --prefix2=http://onedio.com:80/haber
```
Example output:

```
1 - 271: http://onedio.com:80/haber/parasini-odememize-ragmen-tam-randiman-alamadigimiz-15-sey-432236?utm_source=onediocom&utm_campaign=facebook_page&utm_medium=facebook
2 - 124: http://onedio.com:80/haber/senin-seksiliginin-turu-ne--432707
3 - 50: http://onedio.com:80/haber/kadinlarin-yapmaktan-vazgecmeleri-gereken-23-sey-433074
4 - 44: http://onedio.com:80/haber/2014-te-muhtemelen-ilginizi-cekmeyip-kacirdiginiz-muhtesem-10-film-433048
5 - 40: http://onedio.com:80/haber/maddede-sarsici-yeni-bir-teori-paralel-bir-evrenin-gecmisinde-mi-yasiyoruz--433248
6 - 39: http://onedio.com:80/haber/sinav-haftasi-capsleri-432229?utm_source=onediocom&utm_campaign=facebook_page&utm_medium=facebook
7 - 38: http://onedio.com:80/haber/grup-mesajlasmalarindan-nefret-etmemizin-ardindaki-12-sebep-432949
8 - 38: http://onedio.com:80/haber/zanlilar-kovalaniyor-433220
9 - 36: http://onedio.com:80/haber/testi-coz-ne-zaman-olecegini-ogren--431448
10 - 35: http://onedio.com:80/haber/bilinc-altimizda-kalan-en-seksi-cizgi-film-karakterleri-432526?utm_source=onediocom&utm_campaign=facebook_page&utm_medium=facebook
```

#### Limiting
By default analyzer brings first 10 rows but this can be changed using `--limit` option. For instance to be able to get 25 rows `--limit=25` should be specifiied.

#### Ascending Order
Analyzer's default behaviour is to bring results in descending order. If ascending order needed, you simply specify `-a` option.


#LICENSE
MIT
