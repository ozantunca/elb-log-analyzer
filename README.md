# Log Analyzer for AWS Elastic Load Balancer

[![npm version](https://badge.fury.io/js/elb-log-analyzer.svg)](https://www.npmjs.org/elb-log-analyzer)
[![Travis](https://travis-ci.org/ozantunca/elb-log-analyzer.svg?branch=master)](https://travis-ci.org/ozantunca/elb-log-analyzer)
[![Snyk](https://snyk.io/test/npm/elb-log-analyzer/badge.svg)](https://snyk.io/test/npm/elb-log-analyzer)

ELB log analyzer is a command line tool for parsing Elastic Load Balancer's access logs and getting quick statistics. Useful for detecting requests taking longest time, IPs making most requests and many other data that can be derived from log files. If you need help bulk downloading logs from your S3 bucket, try [elblogs](https://github.com/namirali/elblogs).

<a href="https://www.buymeacoffee.com/7U6J1fT" target="_blank"><img src="https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a> If you like using the tool, consider buying me a coffee ☕️

## Installation

```sh
npm install -g elb-log-analyzer
```

Alternatively you can use the tool without downloading by running it via `npx`. Example:

```sh
npx elb-log-analyzer ./logs
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

By default log analyzer will count all requests and sort them in descending order so that most requested URLs will be listed. This functionality can be changed but this one was chosen as default behaviour since it appears to be the most common case. Example output:

```sh
1 - 930: http://example.com:80/img/blabla.jpg
2 - 827: http://example.com:80/images/trans.png
3 - 690: http://example.com:80/stylesheets/external/font-awesome.css
4 - 670: http://example.com:80/images/logo/example-logo2x.png
5 - 633: http://example.com:80/
6 - 404: http://example.com:80/images/logo/example-logo.png
7 - 398: http://example.com:80/images/icon/article-comment-example.png
8 - 355: http://example.com:80/favicons/favicon-32x32.png
9 - 341: http://example.com:80/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3
10 - 327: http://www.example.com:80/favicon.ico
```

Values in columns can be set to any of the values in logs files which can be seen here http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/access-log-collection.html#access-log-entry-format. There are total of 18 extra fields added to these which are:

- `count`
- `total_time`
- `requested_resource`
- `client`
- `backend`
- `requested_resource.pathname`
- `requested_resource.host`
- `requested_resource.protocol`
- `requested_resource.port`
- `requested_resource.hostname`
- `requested_resource.path`
- `requested_resource.origin`
- `requested_resource.search`
- `requested_resource.href`
- `requested_resource.hash`
- `requested_resource.searchParams`
- `requested_resource.username`
- `requested_resource.password`
- `method`

When `count` is specified, it serves as a **groupBy** method that counts values in the other column and groups them together. Note that column1 is `count` by default.

`total_time` is obtained by summing up `request_processing_time`, `backend_processing_time` and `response_processing_time`.

`requested_resource` is a URL obtained by parsing `request` field. `requested_resource` is column2 by default.

`client` is the client IP. ELB provides IP and ports as pairs. This field added to filter by only IP instead of the pair.

`backend` is the backend IP. ELB provides IP and ports as pairs. This field added to filter by only IP instead of the pair.

`method` is the HTTP method e.g. `GET`, `POST` and so on.

Columns can be changed like this:

```sh
elb-log-analyzer logs/ --col2=client:port
```

This command shows client IPs that make requests the most. Example output:

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

Another example command below gets clients that make requests which take the longest time in total.

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

#### Adding More Columns

Keep defining columns with `--col*` pattern such as `--col3`, `--col4`, `--col5`.

```sh
elb-log-analyzer logs/ --col1=count --col2=client:port --col3=elb_status_code
```

Example output:

```
1 - 188 - 54.239.167.83:11419 - 200
2 - 180 - 54.239.167.83:3785 - 200
3 - 174 - 54.239.167.83:25425 - 200
4 - 151 - 54.239.167.83:7662 - 200
5 - 142 - 54.239.167.83:47941 - 200
6 - 128 - 54.239.167.83:3678 - 200
7 - 121 - 54.239.167.83:43780 - 200
8 - 121 - 54.239.167.83:26150 - 200
9 - 94 - 54.239.167.83:53202 - 200
10 - 94 - 176.41.174.153:59649 - 304
```

#### SortBy

You can select the column you want the results to be sorted by. Use `--sortBy` argument and specify the column number.

```sh
elb-log-analyzer logs/ --col1=count --col2=client:port --col3=elb_status_code --sortBy=2
```

#### Filtering

##### Filter by prefix

A string can be provided to get values that starts with given string. This can be done using `--prefix1` and/or `--prefix2` options depending the column that needs to be queried. For example this feature can be used to get number of resources requested starting with certain URL. The command that performs this action would be similar to the one below:

```sh
elb-log-analyzer logs/ --col1=count --col2=requested_resource --prefix2=http://example.com:80/article
```

Example output:

```
1 - 271: http://example.com:80/article/432236?utm_source=examplecom&utm_campaign=facebook_page&utm_medium=facebook
2 - 124: http://example.com:80/article/432707
3 - 50: http://example.com:80/article/433074
4 - 44: http://example.com:80/article/433048
5 - 40: http://example.com:80/article/433248
6 - 39: http://example.com:80/article/432229?utm_source=examplecom&utm_campaign=facebook_page&utm_medium=facebook
7 - 38: http://example.com:80/article/432949
8 - 38: http://example.com:80/article/433220
9 - 36: http://example.com:80/article/431448
10 - 35: http://example.com:80/article/432526?utm_source=examplecom&utm_campaign=facebook_page&utm_medium=facebook
```

##### Filter by date

You can specify any valid JavaScript date that `new Date()` successfully processes. Be aware that it does not accept timestamp numbers currently. This is a design choice to enable users to specify only a year, not the whole date string. Example usage is below.

```sh
elb-log-analyzer logs/ --start=2015-11-07T18:45:34.501734Z --end=2015-11-07T18:45:34.768481Z
```

Example output:

```
1 - 4 - http://example.com:80/images/logo/example-o-logo.png
2 - 4 - http://example.com:80/images/logo/google-play.png
3 - 4 - http://example.com:80/images/icon/collapse.png
4 - 4 - http://example.com:80/images/logo/app-store.png
5 - 4 - http://example.com:80/images/logo/devices.png
6 - 4 - http://example.com:80/img/user/000000000000000000000000
7 - 4 - http://example.com:80/favicon.ico
8 - 2 - http://cf-source.example.com:80/img/719/bound/2r0/54b7cc86d22d31bf16a10f86.webp
9 - 2 - http://cf-source.example.com:80/img/600/300/2r0/502a456a2ab3d1d03300af9a.jpg
10 - 2 - http://cf-source.example.com:80/img/600/300/2r0/55f94dedf5ef747e16a4a640.jpg
```

The usages below are also acceptable.

```sh
elb-log-analyzer logs/ --start=2016
elb-log-analyzer logs/ --start=2016-05-30
elb-log-analyzer logs/ --start=2016/05/30
elb-log-analyzer logs/ --start="2015-11-07 18:45:34"
elb-log-analyzer logs/ --end=2015-11-07T18:45:34.768481Z
```

#### Limiting

By default analyzer brings first 10 rows but this can be changed using `--limit` option. For instance to be able to get 25 rows `--limit=25` should be specifiied.

#### Ascending Order

Analyzer's default behaviour is to bring results in descending order. If ascending order needed, you simply specify `-a` option.

#### Version

`--version` or `-v` option returns the version of `elb-log-analyzer`.

```sh
elb-log-analyzer -v
```

Example Output:

```
v1.3.0
```

#### Roadmap

- Will be usable as a library in addition to CLI usage
- CLI will run multiple clusters to speed up the process and escape from memory limitations

#### If you like what you see, consider buying me a coffee ☕️

<a href="https://www.buymeacoffee.com/7U6J1fT" target="_blank"><img src="https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
