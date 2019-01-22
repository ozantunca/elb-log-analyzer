
var assert = require('chai').assert
var exec = require('child_process').exec
var async = require('async')
var analyzer = require('../')

function cleanStdout (stdout) {
  return stdout.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

describe('elb-log-analyzer', function() {
  describe('cli mode', function () {
    it('should analyze directory', function (done) {
      exec('node dist/cli.js logs', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 99 - http://example.com:80/images/trans.png\n2 - 99 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 87 - http://example.com:80/img/user/000000000000000000000000\n4 - 81 - http://www.example.com:80/favicon.ico\n5 - 69 - http://example.com:80/favicons/favicon-32x32.png\n6 - 57 - http://example.com:80/favicons/favicon-16x16.png\n7 - 48 - http://example.com:80/images/logo/devices.png\n8 - 45 - http://example.com:80/images/icon/collapse.png\n9 - 45 - http://example.com:80/\n10 - 45 - http://example.com:80/images/logo/google-play.png\n')
        done()
      })
    })

    it('should analyze a file', function (done) {
      exec('node dist/cli.js logs/AWSLogs.log', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 33 - http://example.com:80/images/trans.png\n2 - 33 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 29 - http://example.com:80/img/user/000000000000000000000000\n4 - 27 - http://www.example.com:80/favicon.ico\n5 - 23 - http://example.com:80/favicons/favicon-32x32.png\n6 - 19 - http://example.com:80/favicons/favicon-16x16.png\n7 - 16 - http://example.com:80/images/logo/devices.png\n8 - 15 - http://example.com:80/images/icon/collapse.png\n9 - 15 - http://example.com:80/\n10 - 15 - http://example.com:80/images/logo/google-play.png\n')
        done()
      })
    })

    it('should analyze multiple files', function (done) {
      exec('node dist/cli.js logs/AWSLogs.log logs/inner-logs/AWSLogs2.log', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 66 - http://example.com:80/images/trans.png\n2 - 66 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 58 - http://example.com:80/img/user/000000000000000000000000\n4 - 54 - http://www.example.com:80/favicon.ico\n5 - 46 - http://example.com:80/favicons/favicon-32x32.png\n6 - 38 - http://example.com:80/favicons/favicon-16x16.png\n7 - 32 - http://example.com:80/images/logo/devices.png\n8 - 30 - http://example.com:80/images/icon/collapse.png\n9 - 30 - http://example.com:80/\n10 - 30 - http://example.com:80/images/logo/google-play.png\n')
        done()
      })
    })

    it('ascending order', function (done) {
      exec('node dist/cli.js logs -a', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 1 - http://example.com:443/yasam/iliskiler-haberleri\n2 - 1 - wss://example.com:443/favicons/apple-touch-icon-180x180.png\n3 - 1 - ws://example.com:443/favicons/favicon-32x32.png\n4 - 1 - http://example.com:443/stylesheets/external/font-awesome.css\n5 - 1 - http://example.com:443/favicons/favicon-16x16.png\n6 - 1 - h2://example.com:443/favicons/favicon-16x16.png\n7 - 1 - h2://example.com:443/favicons/favicon-96x96.png\n8 - 1 - h2://example.com:443/favicons/favicon-160x160.png\n9 - 1 - h2://example.com:443/favicons/favicon-192x192.png\n10 - 1 - ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n')
        done()
      })
    })

    it('custom sortBy', function (done) {
      exec('node dist/cli.js logs --sortBy=2', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 1 - wss://example.com:443/index.json?scope=galleries&after=1446725611907&iteration=4\n2 - 1 - wss://example.com:443/favicons/apple-touch-icon-180x180.png\n3 - 1 - wss://example.com:443/?mode=json&after=1446874817085&iteration=1\n4 - 1 - wss://example.com:443/?mode=json&after=&iteration=1\n5 - 1 - ws://example.com:443/index.json?scope=galleries&after=1446572248013&iteration=7\n6 - 1 - ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n7 - 1 - ws://example.com:443/favicons/favicon-96x96.png\n8 - 1 - ws://example.com:443/favicons/favicon-32x32.png\n9 - 1 - ws://example.com:443/favicons/apple-touch-icon-180x180.png\n10 - 1 - ws://example.com:443/example-ozel/ilginc-haberleri/3\n')
        done()
      })
    })

    it('custom sortBy ascending', function (done) {
      exec('node dist/cli.js logs --sortBy=2 -a', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 1 - h2://example.com:443/?mode=json&after=&iteration=1\n2 - 2 - h2://example.com:443/example-ozel/test-haberleri\n3 - 1 - h2://example.com:443/favicons/favicon-160x160.png\n4 - 1 - h2://example.com:443/favicons/favicon-16x16.png\n5 - 1 - h2://example.com:443/favicons/favicon-192x192.png\n6 - 1 - h2://example.com:443/favicons/favicon-96x96.png\n7 - 1 - h2://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n8 - 1 - h2://example.com:443/images/icon/article-comment-example.png\n9 - 2 - h2://example.com:443/images/logo/example-new2x.png\n10 - 3 - h2://example.com:443/img/user/000000000000000000000000\n')
        done()
      })
    })

    it('custom column', function (done) {
      exec('node dist/cli.js logs/ --col2=client:port', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 18 - 95.15.16.130:58685\n2 - 18 - 216.137.58.48:40350\n3 - 18 - 216.137.60.6:14612\n4 - 15 - 216.137.60.6:28983\n5 - 15 - 95.14.129.124:49456\n6 - 15 - 216.137.60.6:61784\n7 - 15 - 77.92.102.34:4652\n8 - 12 - 195.142.92.249:52094\n9 - 12 - 216.137.60.6:55852\n10 - 12 - 85.102.129.207:1713\n')
        done()
      })
    })

    it('custom column client and backend IPs w/o port', function (done) {
      async.parallel([
        async.apply(exec, 'node dist/cli.js logs/ --col2=client'),
        async.apply(exec, 'node dist/cli.js logs/ --col2=backend'),
      ], function (err, results) {
        assert.isNull(err)

        // stderr
        assert.equal(cleanStdout(results[0][1]), '\n')
        assert.equal(cleanStdout(results[1][1]), '\n')

        // stdout
        assert.equal(cleanStdout(results[0][0]), '1 - 126 - 216.137.60.6\n2 - 78 - 54.239.167.74\n3 - 60 - 216.137.58.48\n4 - 57 - 95.7.142.5\n5 - 54 - 77.92.102.34\n6 - 36 - 54.239.171.99\n7 - 36 - 205.251.252.16\n8 - 33 - 54.240.156.59\n9 - 33 - 88.246.209.164\n10 - 33 - 95.14.129.124\n')
        assert.equal(cleanStdout(results[1][0]), '1 - 1245 - 10.0.2.143\n2 - 759 - 10.0.0.215\n')

        done()
      })
    })

    it('multiple custom columns', function (done) {
      exec('node dist/cli.js logs/ --col1=total_time --col2=client:port', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 2.094293 - 205.251.252.16:5173\n2 - 2.094293 - 205.251.252.16:5173\n3 - 2.094293 - 205.251.252.16:5173\n4 - 1.423956 - 85.107.47.8:20755\n5 - 1.423956 - 85.107.47.8:20755\n6 - 1.423956 - 85.107.47.8:20755\n7 - 1.272112 - 54.240.156.59:63875\n8 - 1.272112 - 54.240.156.59:63875\n9 - 1.272112 - 54.240.156.59:63875\n10 - 1.2584359999999999 - 54.240.145.65:64483\n')
        done()
      })
    })

    it('multiple custom columns with sortBy', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --sortBy=2', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 3 - 95.9.8.42:49810 - 301\n2 - 3 - 95.70.131.112:38452 - 200\n3 - 3 - 95.7.60.91:38709 - 304\n4 - 3 - 95.7.142.5:1517 - 200\n5 - 3 - 95.7.142.5:1516 - 200\n6 - 3 - 95.7.142.5:1515 - 200\n7 - 3 - 95.7.142.5:1514 - 301\n8 - 3 - 95.7.142.5:1513 - 302\n9 - 3 - 95.7.142.5:1513 - 200\n10 - 3 - 95.7.142.5:1484 - 200\n')
        done()
      })
    })

    it('prefixing', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 18 - 95.15.16.130:58685 - 200\n2 - 15 - 95.14.129.124:49456 - 200\n3 - 12 - 95.14.129.124:49457 - 200\n4 - 9 - 95.10.99.215:2591 - 200\n5 - 9 - 95.7.142.5:1445 - 200\n6 - 6 - 95.65.184.99:52168 - 200\n7 - 6 - 95.7.142.5:1454 - 200\n8 - 6 - 95.7.142.5:1446 - 200\n9 - 6 - 95.7.142.5:1444 - 200\n10 - 3 - 95.13.202.204:35910 - 304\n')
        done()
      })
    })

    it('prefixing count field', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix1=1', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 18 - 95.15.16.130:58685 - 200\n2 - 18 - 216.137.58.48:40350 - 200\n3 - 15 - 216.137.60.6:28983 - 200\n4 - 15 - 95.14.129.124:49456 - 200\n5 - 15 - 77.92.102.34:4652 - 200\n6 - 12 - 195.142.92.249:52094 - 200\n7 - 12 - 85.102.129.207:1713 - 200\n8 - 12 - 85.102.129.207:1714 - 200\n9 - 12 - 216.137.60.6:61784 - 200\n10 - 12 - 54.240.156.59:62545 - 200\n')
        done()
      })
    })

    it('prefixing count field with sortBy', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix1=1 --sortBy=2 -a', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 12 - 195.142.92.249:52094 - 200\n2 - 18 - 216.137.58.48:40350 - 200\n3 - 12 - 216.137.60.6:14612 - 200\n4 - 15 - 216.137.60.6:28983 - 200\n5 - 12 - 216.137.60.6:29161 - 200\n6 - 12 - 216.137.60.6:61784 - 200\n7 - 12 - 54.240.156.59:62545 - 200\n8 - 15 - 77.92.102.34:4652 - 200\n9 - 12 - 85.102.129.207:1713 - 200\n10 - 12 - 85.102.129.207:1714 - 200\n')
        done()
      })
    })

    it('custom limits for the list', function (done) {
      exec('node dist/cli.js logs --limit=25', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 99 - http://example.com:80/images/trans.png\n2 - 99 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 87 - http://example.com:80/img/user/000000000000000000000000\n4 - 81 - http://www.example.com:80/favicon.ico\n5 - 69 - http://example.com:80/favicons/favicon-32x32.png\n6 - 57 - http://example.com:80/favicons/favicon-16x16.png\n7 - 48 - http://example.com:80/images/logo/devices.png\n8 - 45 - http://example.com:80/images/icon/collapse.png\n9 - 45 - http://example.com:80/\n10 - 45 - http://example.com:80/images/logo/google-play.png\n11 - 45 - http://example.com:80/images/logo/app-store.png\n12 - 42 - http://example.com:80/favicon.ico\n13 - 42 - http://example.com:80/favicons/favicon-192x192.png\n14 - 39 - http://example.com:80/stylesheets/external/font-awesome.css\n15 - 39 - http://example.com:80/favicons/favicon-160x160.png\n16 - 36 - http://example.com:80/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n17 - 36 - http://example.com:80/images/logo/example-o-logo.png\n18 - 36 - http://example.com:80/images/logo/example-new2x.png\n19 - 36 - http://example.com:80/favicons/favicon.ico\n20 - 33 - http://example.com:80/images/icon/article-comment-example.png\n21 - 30 - http://example.com:80/favicons/favicon-96x96.png\n22 - 21 - http://example.com:80/example-ozel/test-haberleri\n23 - 18 - http://example.com:80/mobile/ios/sidemenu.json\n24 - 18 - http://ios.example.com:80/mobile/ios/register-push\n25 - 16 - https://example.com:443/?mode=json&after=&iteration=1\n')
        done()
      })
    })

    it('custom limits with sortBy', function (done) {
      exec('node dist/cli.js logs --sortBy=2 --limit=20', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 1 - wss://example.com:443/index.json?scope=galleries&after=1446725611907&iteration=4\n2 - 1 - wss://example.com:443/favicons/apple-touch-icon-180x180.png\n3 - 1 - wss://example.com:443/?mode=json&after=1446874817085&iteration=1\n4 - 1 - wss://example.com:443/?mode=json&after=&iteration=1\n5 - 1 - ws://example.com:443/index.json?scope=galleries&after=1446572248013&iteration=7\n6 - 1 - ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n7 - 1 - ws://example.com:443/favicons/favicon-96x96.png\n8 - 1 - ws://example.com:443/favicons/favicon-32x32.png\n9 - 1 - ws://example.com:443/favicons/apple-touch-icon-180x180.png\n10 - 1 - ws://example.com:443/example-ozel/ilginc-haberleri/3\n11 - 1 - ws://example.com:443/ara?q=bebek\n12 - 1 - ws://example.com:443/api/category/headerlisting\n13 - 1 - ws://example.com:443/?mode=json&after=1446874817085&iteration=1\n14 - 1 - ws://example.com:443/?mode=json&after=&iteration=1\n15 - 2 - https://example.com:443/yasam/iliskiler-haberleri\n16 - 2 - https://example.com:443/videolar\n17 - 7 - https://example.com:443/stylesheets/external/font-awesome.css\n18 - 2 - https://example.com:443/profil/streetkedisi\n19 - 2 - https://example.com:443/profil/burak-gumus\n20 - 2 - https://example.com:443/profil/54f1f544105208421b6a4fe5\n')
        done()
      })
    })

    it('custom limit with custom columns and prefixing', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95 --limit=5', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 18 - 95.15.16.130:58685 - 200\n2 - 15 - 95.14.129.124:49456 - 200\n3 - 12 - 95.14.129.124:49457 - 200\n4 - 9 - 95.10.99.215:2591 - 200\n5 - 9 - 95.7.142.5:1445 - 200\n')
        done()
      })
    })

    it('request more records than there are', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95 --limit=5000', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 18 - 95.15.16.130:58685 - 200\n2 - 15 - 95.14.129.124:49456 - 200\n3 - 12 - 95.14.129.124:49457 - 200\n4 - 9 - 95.10.99.215:2591 - 200\n5 - 9 - 95.7.142.5:1445 - 200\n6 - 6 - 95.65.184.99:52168 - 200\n7 - 6 - 95.7.142.5:1454 - 200\n8 - 6 - 95.7.142.5:1446 - 200\n9 - 6 - 95.7.142.5:1444 - 200\n10 - 3 - 95.13.202.204:35910 - 304\n11 - 3 - 95.13.122.139:55645 - 200\n12 - 3 - 95.14.129.124:49512 - 302\n13 - 3 - 95.5.5.17:62820 - 302\n14 - 3 - 95.14.129.124:49512 - 200\n15 - 3 - 95.7.142.5:1513 - 302\n16 - 3 - 95.70.131.112:38452 - 200\n17 - 3 - 95.12.73.113:54944 - 301\n18 - 3 - 95.9.8.42:49810 - 301\n19 - 3 - 95.15.104.165:42512 - 301\n20 - 3 - 95.7.142.5:1517 - 200\n21 - 3 - 95.7.142.5:1516 - 200\n22 - 3 - 95.7.142.5:1515 - 200\n23 - 3 - 95.10.99.215:2590 - 200\n24 - 3 - 95.7.142.5:1514 - 301\n25 - 3 - 95.7.142.5:1513 - 200\n26 - 3 - 95.7.142.5:1484 - 200\n27 - 3 - 95.7.142.5:1483 - 200\n28 - 3 - 95.7.142.5:1482 - 200\n29 - 3 - 95.0.141.142:10023 - 200\n30 - 3 - 95.7.60.91:38709 - 304\n31 - 3 - 95.7.142.5:1480 - 200\n32 - 3 - 95.10.4.221:34614 - 200\n33 - 3 - 95.65.183.56:54479 - 302\n34 - 3 - 95.108.225.230:42116 - 200\n35 - 3 - 95.15.108.252:46888 - 301\n36 - 3 - 95.13.166.72:27286 - 302\n37 - 3 - 95.13.166.72:27241 - 304\n38 - 3 - 95.13.166.72:27225 - 304\n39 - 3 - 95.13.166.72:27152 - 304\n')
        done()
      })
    })

    it('filtering by date', function (done) {
      exec('node dist/cli.js logs/ --start=2015-11-07T18:45:34.501734Z --end=2015-11-07T18:45:34.768481Z', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 6 - http://example.com:80/images/logo/example-o-logo.png\n2 - 6 - http://example.com:80/images/logo/google-play.png\n3 - 6 - http://example.com:80/images/icon/collapse.png\n4 - 6 - http://example.com:80/images/logo/app-store.png\n5 - 6 - http://example.com:80/images/logo/devices.png\n6 - 6 - http://example.com:80/img/user/000000000000000000000000\n7 - 6 - http://example.com:80/favicon.ico\n8 - 3 - http://cf-source.example.com:80/img/719/bound/2r0/54b7cc86d22d31bf16a10f86.webp\n9 - 3 - http://cf-source.example.com:80/img/600/300/2r0/502a456a2ab3d1d03300af9a.jpg\n10 - 3 - http://cf-source.example.com:80/img/600/300/2r0/55f94dedf5ef747e16a4a640.jpg\n')
        done()
      })
    })

    it('filtering by date 2', function (done) {
      exec('node dist/cli.js logs/ --end=2015-11-07T18:45:35.368553Z', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 45 - http://example.com:80/?mode=json&after=&iteration=1\n2 - 45 - http://example.com:80/img/user/000000000000000000000000\n3 - 33 - http://example.com:80/images/trans.png\n4 - 30 - http://example.com:80/images/icon/collapse.png\n5 - 27 - http://www.example.com:80/favicon.ico\n6 - 27 - http://example.com:80/\n7 - 24 - http://example.com:80/images/logo/app-store.png\n8 - 24 - http://example.com:80/favicons/favicon-32x32.png\n9 - 24 - http://example.com:80/stylesheets/external/font-awesome.css\n10 - 24 - http://example.com:80/images/logo/devices.png\n')
        done()
      })
    })

    it('filter by client and backend CIDR', function (done) {
      exec('node dist/cli.js logs/ --clientCidr=95.0.0.0/8 --backendCidr=10.0.2.143 --col1=count --col2=client --col3=backend', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 36 - 95.7.142.5 - 10.0.2.143\n2 - 21 - 95.14.129.124 - 10.0.2.143\n3 - 9 - 95.15.16.130 - 10.0.2.143\n4 - 6 - 95.10.99.215 - 10.0.2.143\n5 - 3 - 95.13.202.204 - 10.0.2.143\n6 - 3 - 95.13.122.139 - 10.0.2.143\n7 - 3 - 95.5.5.17 - 10.0.2.143\n8 - 3 - 95.70.131.112 - 10.0.2.143\n9 - 3 - 95.65.184.99 - 10.0.2.143\n10 - 3 - 95.0.141.142 - 10.0.2.143\n')
        done()
      })
    })

    it('should parse application ELB logs as well', function (done) {
      exec('node dist/cli.js logs/AppELBLog.log --col2=type', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 219 - http\n2 - 161 - h2\n3 - 148 - https\n4 - 71 - ws\n5 - 69 - wss\n')
        done()
      })
    })

    it('should parse application ELB logs in directory as well', function (done) {
      exec('node dist/cli.js logs --col2=type', function (err, stdout) {
        assert.isNull(err)
        assert.equal(cleanStdout(stdout), '1 - 219 - http\n2 - 161 - h2\n3 - 148 - https\n4 - 71 - ws\n5 - 69 - wss\n')
        done()
      })
    })
  });

  describe('library mode', function () {
    it('should analyze directory', function (done) {
      var result = [ [ 99, 'http://example.com:80/images/trans.png' ],
        [ 99, 'http://example.com:80/?mode=json&after=&iteration=1' ],
        [ 87,
          'http://example.com:80/img/user/000000000000000000000000' ],
        [ 81, 'http://www.example.com:80/favicon.ico' ],
        [ 69, 'http://example.com:80/favicons/favicon-32x32.png' ],
        [ 57, 'http://example.com:80/favicons/favicon-16x16.png' ],
        [ 48, 'http://example.com:80/images/logo/devices.png' ],
        [ 45, 'http://example.com:80/images/icon/collapse.png' ],
        [ 45, 'http://example.com:80/' ],
        [ 45, 'http://example.com:80/images/logo/google-play.png' ] ]

      analyzer({
        files: ['./logs']
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('should analyze a file', function (done) {
      var result = [ [ 33, 'http://example.com:80/images/trans.png' ],
        [ 33, 'http://example.com:80/?mode=json&after=&iteration=1' ],
        [ 29,
          'http://example.com:80/img/user/000000000000000000000000' ],
        [ 27, 'http://www.example.com:80/favicon.ico' ],
        [ 23, 'http://example.com:80/favicons/favicon-32x32.png' ],
        [ 19, 'http://example.com:80/favicons/favicon-16x16.png' ],
        [ 16, 'http://example.com:80/images/logo/devices.png' ],
        [ 15, 'http://example.com:80/images/icon/collapse.png' ],
        [ 15, 'http://example.com:80/' ],
        [ 15, 'http://example.com:80/images/logo/google-play.png' ] ]

      analyzer({
        files: ['./logs/AWSLogs.log']
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('should analyze multiple files', function (done) {
      var result = [ [ 66, 'http://example.com:80/images/trans.png' ],
        [ 66, 'http://example.com:80/?mode=json&after=&iteration=1' ],
        [ 58,
          'http://example.com:80/img/user/000000000000000000000000' ],
        [ 54, 'http://www.example.com:80/favicon.ico' ],
        [ 46, 'http://example.com:80/favicons/favicon-32x32.png' ],
        [ 38, 'http://example.com:80/favicons/favicon-16x16.png' ],
        [ 32, 'http://example.com:80/images/logo/devices.png' ],
        [ 30, 'http://example.com:80/images/icon/collapse.png' ],
        [ 30, 'http://example.com:80/' ],
        [ 30, 'http://example.com:80/images/logo/google-play.png' ] ]

      analyzer({
        files: ['logs/AWSLogs.log', 'logs/inner-logs/AWSLogs2.log']
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('ascending order', function (done) {
      var result = [
        [1, 'http://example.com:443/yasam/iliskiler-haberleri'],
        [1, 'wss://example.com:443/favicons/apple-touch-icon-180x180.png'],
        [1, 'ws://example.com:443/favicons/favicon-32x32.png'],
        [1, 'http://example.com:443/stylesheets/external/font-awesome.css'],
        [1, 'http://example.com:443/favicons/favicon-16x16.png'],
        [1, 'h2://example.com:443/favicons/favicon-16x16.png'],
        [1, 'h2://example.com:443/favicons/favicon-96x96.png'],
        [1, 'h2://example.com:443/favicons/favicon-160x160.png'],
        [1, 'h2://example.com:443/favicons/favicon-192x192.png'],
        [1, 'ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3'],
      ];

      analyzer({
        files: ['logs'],
        ascending: true,
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('custom sortBy', function (done) {
      var result = [
        [1, 'wss://example.com:443/index.json?scope=galleries&after=1446725611907&iteration=4'],
        [1, 'wss://example.com:443/favicons/apple-touch-icon-180x180.png'],
        [1, 'wss://example.com:443/?mode=json&after=1446874817085&iteration=1'],
        [1, 'wss://example.com:443/?mode=json&after=&iteration=1'],
        [1, 'ws://example.com:443/index.json?scope=galleries&after=1446572248013&iteration=7'],
        [1, 'ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3'],
        [1, 'ws://example.com:443/favicons/favicon-96x96.png'],
        [1, 'ws://example.com:443/favicons/favicon-32x32.png'],
        [1, 'ws://example.com:443/favicons/apple-touch-icon-180x180.png'],
        [1, 'ws://example.com:443/example-ozel/ilginc-haberleri/3'],
      ];

      analyzer({
        files: ['logs'],
        sortBy: 1,
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })


    it('custom sortBy ascending', function (done) {
      var result = [
        [1, 'h2://example.com:443/?mode=json&after=&iteration=1'],
        [2, 'h2://example.com:443/example-ozel/test-haberleri'],
        [1, 'h2://example.com:443/favicons/favicon-160x160.png'],
        [1, 'h2://example.com:443/favicons/favicon-16x16.png'],
        [1, 'h2://example.com:443/favicons/favicon-192x192.png'],
        [1, 'h2://example.com:443/favicons/favicon-96x96.png'],
        [1, 'h2://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3'],
        [1, 'h2://example.com:443/images/icon/article-comment-example.png'],
        [2, 'h2://example.com:443/images/logo/example-new2x.png'],
        [3, 'h2://example.com:443/img/user/000000000000000000000000'],
      ];

      analyzer({
        files: ['logs'],
        ascending: true,
        sortBy: 1,
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('custom column', function (done) {
      var result = [ [ 18, '95.15.16.130:58685' ],
        [ 18, '216.137.58.48:40350' ],
        [ 18, '216.137.60.6:14612' ],
        [ 15, '216.137.60.6:28983' ],
        [ 15, '95.14.129.124:49456' ],
        [ 15, '216.137.60.6:61784' ],
        [ 15, '77.92.102.34:4652' ],
        [ 12, '195.142.92.249:52094' ],
        [ 12, '216.137.60.6:55852' ],
        [ 12, '85.102.129.207:1713' ] ]

      analyzer({
        files: ['logs'],
        cols: ['count', 'client:port'],
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('custom column client and backend IPs w/o port', function (done) {
      var result1 = [ [ 126, '216.137.60.6' ],
        [ 78, '54.239.167.74' ],
        [ 60, '216.137.58.48' ],
        [ 57, '95.7.142.5' ],
        [ 54, '77.92.102.34' ],
        [ 36, '54.239.171.99' ],
        [ 36, '205.251.252.16' ],
        [ 33, '54.240.156.59' ],
        [ 33, '88.246.209.164' ],
        [ 33, '95.14.129.124' ] ]
      var result2 = [ [ 1245, '10.0.2.143' ], [ 759, '10.0.0.215' ] ]

      Promise.all([
        analyzer({
          files: ['logs'],
          cols: ['count', 'client'],
        }),

        analyzer({
          files: ['logs'],
          cols: ['count', 'backend'],
        })
      ]).then(function (logs) {
        logs[0].forEach(function (log, i) {
          assert.equal(result1[i][0], log[0]);
          assert.equal(result1[i][1], log[1]);
        })

        logs[1].forEach(function (log, i) {
          assert.equal(result2[i][0], log[0]);
          assert.equal(result2[i][1], log[1]);
        })
        done()
      })
    })

    it('multiple custom columns', function (done) {
      var result = [ [ 2.094293, '205.251.252.16:5173' ],
        [ 2.094293, '205.251.252.16:5173' ],
        [ 2.094293, '205.251.252.16:5173' ],
        [ 1.423956, '85.107.47.8:20755' ],
        [ 1.423956, '85.107.47.8:20755' ],
        [ 1.423956, '85.107.47.8:20755' ],
        [ 1.272112, '54.240.156.59:63875' ],
        [ 1.272112, '54.240.156.59:63875' ],
        [ 1.272112, '54.240.156.59:63875' ],
        [ 1.2584359999999999, '54.240.145.65:64483' ] ]

      analyzer({
        files: ['logs'],
        cols: ['total_time', 'client:port'],
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('multiple custom columns with sortBy', function (done) {
      var result = [ [ 3, '95.9.8.42:49810', '301' ],
        [ 3, '95.70.131.112:38452', '200' ],
        [ 3, '95.7.60.91:38709', '304' ],
        [ 3, '95.7.142.5:1517', '200' ],
        [ 3, '95.7.142.5:1516', '200' ],
        [ 3, '95.7.142.5:1515', '200' ],
        [ 3, '95.7.142.5:1514', '301' ],
        [ 3, '95.7.142.5:1513', '302' ],
        [ 3, '95.7.142.5:1513', '200' ],
        [ 3, '95.7.142.5:1484', '200' ] ]

      analyzer({
        files: ['logs'],
        cols: ['count', 'client:port', 'elb_status_code'],
        sortBy: 1,
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('prefixing', function (done) {
      var result = [ [ 18, '95.15.16.130:58685', '200' ],
        [ 15, '95.14.129.124:49456', '200' ],
        [ 12, '95.14.129.124:49457', '200' ],
        [ 9, '95.10.99.215:2591', '200' ],
        [ 9, '95.7.142.5:1445', '200' ],
        [ 6, '95.65.184.99:52168', '200' ],
        [ 6, '95.7.142.5:1454', '200' ],
        [ 6, '95.7.142.5:1446', '200' ],
        [ 6, '95.7.142.5:1444', '200' ],
        [ 3, '95.13.202.204:35910', '304' ] ]

      analyzer({
        files: ['logs'],
        cols: ['count', 'client:port', 'elb_status_code'],
        prefixes: [null, '95'],
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('prefixing count field', function (done) {
      var result = [
        [18, '95.15.16.130:58685', '200'],
        [18, '216.137.58.48:40350', '200'],
        [15, '216.137.60.6:28983', '200'],
        [15, '95.14.129.124:49456', '200'],
        [15, '77.92.102.34:4652', '200'],
        [12, '195.142.92.249:52094', '200'],
        [12, '85.102.129.207:1713', '200'],
        [12, '85.102.129.207:1714', '200'],
        [12, '216.137.60.6:61784', '200'],
        [12, '54.240.156.59:62545', '200'],
      ];

      analyzer({
        files: ['logs'],
        cols: ['count', 'client:port', 'elb_status_code'],
        prefixes: ['1'],
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('prefixing count field with sortBy', function (done) {
      var result = [
        [12, '195.142.92.249:52094', '200'],
        [18, '216.137.58.48:40350', '200'],
        [12, '216.137.60.6:14612', '200'],
        [15, '216.137.60.6:28983', '200'],
        [12, '216.137.60.6:29161', '200'],
        [12, '216.137.60.6:61784', '200'],
        [12, '54.240.156.59:62545', '200'],
        [15, '77.92.102.34:4652', '200'],
        [12, '85.102.129.207:1713', '200'],
        [12, '85.102.129.207:1714', '200'],
      ];

      analyzer({
        files: ['logs'],
        cols: ['count', 'client:port', 'elb_status_code'],
        prefixes: ['1'],
        sortBy: 1,
        ascending: true,
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('custom limits for the list', function (done) {
      var result = [ [ 99, 'http://example.com:80/images/trans.png' ],
        [ 99, 'http://example.com:80/?mode=json&after=&iteration=1' ],
        [ 87, 'http://example.com:80/img/user/000000000000000000000000' ],
        [ 81, 'http://www.example.com:80/favicon.ico' ],
        [ 69, 'http://example.com:80/favicons/favicon-32x32.png' ],
        [ 57, 'http://example.com:80/favicons/favicon-16x16.png' ],
        [ 48, 'http://example.com:80/images/logo/devices.png' ],
        [ 45, 'http://example.com:80/images/icon/collapse.png' ],
        [ 45, 'http://example.com:80/' ],
        [ 45, 'http://example.com:80/images/logo/google-play.png' ],
        [ 45, 'http://example.com:80/images/logo/app-store.png' ],
        [ 42, 'http://example.com:80/favicon.ico' ],
        [ 42, 'http://example.com:80/favicons/favicon-192x192.png' ],
        [ 39, 'http://example.com:80/stylesheets/external/font-awesome.css' ],
        [ 39, 'http://example.com:80/favicons/favicon-160x160.png' ],
        [ 36, 'http://example.com:80/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3' ],
        [ 36, 'http://example.com:80/images/logo/example-o-logo.png' ],
        [ 36, 'http://example.com:80/images/logo/example-new2x.png' ],
        [ 36, 'http://example.com:80/favicons/favicon.ico' ],
        [ 33, 'http://example.com:80/images/icon/article-comment-example.png' ],
        [ 30, 'http://example.com:80/favicons/favicon-96x96.png' ],
        [ 21, 'http://example.com:80/example-ozel/test-haberleri' ],
        [ 18, 'http://example.com:80/mobile/ios/sidemenu.json' ],
        [ 18, 'http://ios.example.com:80/mobile/ios/register-push' ],
        [ 16, 'https://example.com:443/?mode=json&after=&iteration=1' ] ];

      analyzer({
        files: ['logs'],
        limit: 25,
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('custom limits with sortBy', function (done) {
      var result = [
        [1, 'wss://example.com:443/index.json?scope=galleries&after=1446725611907&iteration=4'],
        [1, 'wss://example.com:443/favicons/apple-touch-icon-180x180.png'],
        [1, 'wss://example.com:443/?mode=json&after=1446874817085&iteration=1'],
        [1, 'wss://example.com:443/?mode=json&after=&iteration=1'],
        [1, 'ws://example.com:443/index.json?scope=galleries&after=1446572248013&iteration=7'],
        [1, 'ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3'],
        [1, 'ws://example.com:443/favicons/favicon-96x96.png'],
        [1, 'ws://example.com:443/favicons/favicon-32x32.png'],
        [1, 'ws://example.com:443/favicons/apple-touch-icon-180x180.png'],
        [1, 'ws://example.com:443/example-ozel/ilginc-haberleri/3'],
        [1, 'ws://example.com:443/ara?q=bebek'],
        [1, 'ws://example.com:443/api/category/headerlisting'],
        [1, 'ws://example.com:443/?mode=json&after=1446874817085&iteration=1'],
        [1, 'ws://example.com:443/?mode=json&after=&iteration=1'],
        [2, 'https://example.com:443/yasam/iliskiler-haberleri'],
        [2, 'https://example.com:443/videolar'],
        [7, 'https://example.com:443/stylesheets/external/font-awesome.css'],
        [2, 'https://example.com:443/profil/streetkedisi'],
        [2, 'https://example.com:443/profil/burak-gumus'],
        [2, 'https://example.com:443/profil/54f1f544105208421b6a4fe5'],
      ];

      analyzer({
        files: ['logs'],
        limit: 20,
        sortBy: 1,
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('custom limit with custom columns and prefixing', function (done) {
      var result = [ [ 18, '95.15.16.130:58685', '200' ],
        [ 18, '216.137.58.48:40350', '200' ],
        [ 15, '216.137.60.6:28983', '200' ],
        [ 15, '95.14.129.124:49456', '200' ],
        [ 15, '77.92.102.34:4652', '200' ] ]

      analyzer({
        files: ['logs'],
        limit: 5,
        cols: ['count', 'client:port', 'elb_status_code'],
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('request more records than there are', function (done) {
      var result = [ [ 18, '95.15.16.130:58685', '200' ],
        [ 15, '95.14.129.124:49456', '200' ],
        [ 12, '95.14.129.124:49457', '200' ],
        [ 9, '95.10.99.215:2591', '200' ],
        [ 9, '95.7.142.5:1445', '200' ],
        [ 6, '95.65.184.99:52168', '200' ],
        [ 6, '95.7.142.5:1454', '200' ],
        [ 6, '95.7.142.5:1446', '200' ],
        [ 6, '95.7.142.5:1444', '200' ],
        [ 3, '95.13.202.204:35910', '304' ],
        [ 3, '95.13.122.139:55645', '200' ],
        [ 3, '95.14.129.124:49512', '302' ],
        [ 3, '95.5.5.17:62820', '302' ],
        [ 3, '95.14.129.124:49512', '200' ],
        [ 3, '95.7.142.5:1513', '302' ],
        [ 3, '95.70.131.112:38452', '200' ],
        [ 3, '95.12.73.113:54944', '301' ],
        [ 3, '95.9.8.42:49810', '301' ],
        [ 3, '95.15.104.165:42512', '301' ],
        [ 3, '95.7.142.5:1517', '200' ],
        [ 3, '95.7.142.5:1516', '200' ],
        [ 3, '95.7.142.5:1515', '200' ],
        [ 3, '95.10.99.215:2590', '200' ],
        [ 3, '95.7.142.5:1514', '301' ],
        [ 3, '95.7.142.5:1513', '200' ],
        [ 3, '95.7.142.5:1484', '200' ],
        [ 3, '95.7.142.5:1483', '200' ],
        [ 3, '95.7.142.5:1482', '200' ],
        [ 3, '95.0.141.142:10023', '200' ],
        [ 3, '95.7.60.91:38709', '304' ],
        [ 3, '95.7.142.5:1480', '200' ],
        [ 3, '95.10.4.221:34614', '200' ],
        [ 3, '95.65.183.56:54479', '302' ],
        [ 3, '95.108.225.230:42116', '200' ],
        [ 3, '95.15.108.252:46888', '301' ],
        [ 3, '95.13.166.72:27286', '302' ],
        [ 3, '95.13.166.72:27241', '304' ],
        [ 3, '95.13.166.72:27225', '304' ],
        [ 3, '95.13.166.72:27152', '304' ] ]

      analyzer({
        files: ['logs'],
        limit: 5000,
        cols: ['count', 'client:port', 'elb_status_code'],
        prefixes: [null, '95']
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('filtering by date', function (done) {
      var result = [ [ 6, 'http://example.com:80/images/logo/example-o-logo.png' ],
        [ 6, 'http://example.com:80/images/logo/google-play.png' ],
        [ 6, 'http://example.com:80/images/icon/collapse.png' ],
        [ 6, 'http://example.com:80/images/logo/app-store.png' ],
        [ 6, 'http://example.com:80/images/logo/devices.png' ],
        [ 6, 'http://example.com:80/img/user/000000000000000000000000' ],
        [ 6, 'http://example.com:80/favicon.ico' ],
        [ 3,
          'http://cf-source.example.com:80/img/719/bound/2r0/54b7cc86d22d31bf16a10f86.webp' ],
        [ 3,
          'http://cf-source.example.com:80/img/600/300/2r0/502a456a2ab3d1d03300af9a.jpg' ],
        [ 3,
          'http://cf-source.example.com:80/img/600/300/2r0/55f94dedf5ef747e16a4a640.jpg' ] ]

      analyzer({
        files: ['logs'],
        start: new Date('2015-11-07T18:45:34.501734Z'),
        end: new Date('2015-11-07T18:45:34.768481Z'),
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('filtering by date 2', function (done) {
      var result = [ [ 45, 'http://example.com:80/?mode=json&after=&iteration=1' ],
        [ 45,
          'http://example.com:80/img/user/000000000000000000000000' ],
        [ 33, 'http://example.com:80/images/trans.png' ],
        [ 30, 'http://example.com:80/images/icon/collapse.png' ],
        [ 27, 'http://www.example.com:80/favicon.ico' ],
        [ 27, 'http://example.com:80/' ],
        [ 24, 'http://example.com:80/images/logo/app-store.png' ],
        [ 24, 'http://example.com:80/favicons/favicon-32x32.png' ],
        [ 24,
          'http://example.com:80/stylesheets/external/font-awesome.css' ],
        [ 24, 'http://example.com:80/images/logo/devices.png' ] ]

      analyzer({
        files: ['logs'],
        end: new Date('2015-11-07T18:45:35.368553Z'),
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('should parse application ELB logs as well', function (done) {
      var result = [
        [219, 'http'],
        [161, 'h2'],
        [148, 'https'],
        [71, 'ws'],
        [69, 'wss'],
      ];

      analyzer({
        files: ['logs/AppELBLog.log'],
        cols: ['count', 'type'],
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })

    it('should parse application ELB logs in directory as well', function (done) {
      var result = [
        [219, 'http'],
        [161, 'h2'],
        [148, 'https'],
        [71, 'ws'],
        [69, 'wss'],
      ];

      analyzer({
        files: ['logs'],
        cols: ['count', 'type'],
      })
      .then(function (logs) {
        logs.forEach(function (log, i) {
          assert.equal(result[i][0], log[0]);
          assert.equal(result[i][1], log[1]);
        })
        done()
      })
    })
  })
});
