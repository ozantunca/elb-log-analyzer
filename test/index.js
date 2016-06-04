
var assert = require('chai').assert;
var exec = require('child_process').exec;
var async = require('async');

describe('elb-log-analyzer', function() {
  describe('basic', function () {
    it('should analyze directory', function (done) {
      exec('node dist/cli.js logs', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 66 - http://example.com:80/images/trans.png\n2 - 66 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 58 - http://example.com:80/img/user/000000000000000000000000\n4 - 54 - http://www.example.com:80/favicon.ico\n5 - 46 - http://example.com:80/favicons/favicon-32x32.png\n6 - 38 - http://example.com:80/favicons/favicon-16x16.png\n7 - 32 - http://example.com:80/images/logo/devices.png\n8 - 30 - http://example.com:80/images/icon/collapse.png\n9 - 30 - http://example.com:80/\n10 - 30 - http://example.com:80/images/logo/google-play.png\n')
        done()
      })
    })

    it('should analyze a file', function (done) {
      exec('node dist/cli.js logs/AWSLogs.log', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 33 - http://example.com:80/images/trans.png\n2 - 33 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 29 - http://example.com:80/img/user/000000000000000000000000\n4 - 27 - http://www.example.com:80/favicon.ico\n5 - 23 - http://example.com:80/favicons/favicon-32x32.png\n6 - 19 - http://example.com:80/favicons/favicon-16x16.png\n7 - 16 - http://example.com:80/images/logo/devices.png\n8 - 15 - http://example.com:80/images/icon/collapse.png\n9 - 15 - http://example.com:80/\n10 - 15 - http://example.com:80/images/logo/google-play.png\n')
        done()
      })
    })

    it('should analyze multiple files', function (done) {
      exec('node dist/cli.js logs/AWSLogs.log logs/AWSLogs2.log', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 66 - http://example.com:80/images/trans.png\n2 - 66 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 58 - http://example.com:80/img/user/000000000000000000000000\n4 - 54 - http://www.example.com:80/favicon.ico\n5 - 46 - http://example.com:80/favicons/favicon-32x32.png\n6 - 38 - http://example.com:80/favicons/favicon-16x16.png\n7 - 32 - http://example.com:80/images/logo/devices.png\n8 - 30 - http://example.com:80/images/icon/collapse.png\n9 - 30 - http://example.com:80/\n10 - 30 - http://example.com:80/images/logo/google-play.png\n')
        done()
      })
    })

    it('ascending order', function (done) {
      exec('node dist/cli.js logs -a', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e37d9208bee5b70f56836.anim\n2 - 2 - http://cf-source.example.com:80/img/600/300/2r0/54558148eab71c6c2517f1d9.jpg\n3 - 2 - http://example.com:80/ara?q=d%C3%B6vme\n4 - 2 - http://example.com:80/api/user/conversation/5590921f9d37a84e20286e3e?newerThan=1446921850251\n5 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e450169a660e447a9166f.anim\n6 - 2 - http://example.com:80/api/article/563ddcc7c85cb4a82fe089b7/favorite\n7 - 2 - http://cf-source.example.com:80/img/719/bound/2r0/546fc703e22d8b4a4585a530.jpg\n8 - 2 - http://cf-source.example.com:80/img/719/bound/2r0/54b7cc3ed22d31bf16a10f69.webm\n9 - 2 - http://cf-source.example.com:80/img/719/bound/2r0/541df13cf95ac89d31aab8c9.gif\n10 - 2 - http://cf-source.example.com:80/img/719/bound/2r0/55c4b4226016e8fc606a7697.webp\n')
        done()
      })
    })

    it('custom sortBy', function (done) {
      exec('node dist/cli.js logs --sortBy=2', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 2 - https://example.com:443/yasam/iliskiler-haberleri\n2 - 2 - https://example.com:443/videolar\n3 - 6 - https://example.com:443/stylesheets/external/font-awesome.css\n4 - 2 - https://example.com:443/profil/streetkedisi\n5 - 2 - https://example.com:443/profil/burak-gumus\n6 - 2 - https://example.com:443/profil/54f1f544105208421b6a4fe5\n7 - 2 - https://example.com:443/index.json?scope=galleries&after=1446725611907&iteration=4\n8 - 2 - https://example.com:443/index.json?scope=galleries&after=1446572248013&iteration=7\n9 - 10 - https://example.com:443/img/user/000000000000000000000000\n10 - 2 - https://example.com:443/images/trans.png\n')
        done()
      })
    })

    it('custom sortBy ascending', function (done) {
      exec('node dist/cli.js logs --sortBy=2 -a', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 2 - http://cf-source.example.com:80/asset-58ce53eeda9c6cf6ca7b80696f9892fd/javascripts/index.js\n2 - 2 - http://cf-source.example.com:80/img/205/205/2r1/554b2e47ab096db828ea3049.anim\n3 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e37d9208bee5b70f56836.anim\n4 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e3895ae7a75e377f934e0.jpg\n5 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e38a572341d5d3e73437f.anim\n6 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e3acae2ae3c3542c4fa31.anim\n7 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e3ad9509a2871412f45f6.anim\n8 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e3adbe2ae3c3542c4fa4d.anim\n9 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e3b8d509a2871412f46e5.anim\n10 - 2 - http://cf-source.example.com:80/img/205/205/2r1/562e3b9a6fe998e379513225.anim\n')
        done()
      })
    })

    it('custom column', function (done) {
      exec('node dist/cli.js logs/ --col2=client:port', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 12 - 95.15.16.130:58685\n2 - 12 - 216.137.58.48:40350\n3 - 12 - 216.137.60.6:14612\n4 - 10 - 216.137.60.6:28983\n5 - 10 - 95.14.129.124:49456\n6 - 10 - 216.137.60.6:61784\n7 - 10 - 77.92.102.34:4652\n8 - 8 - 195.142.92.249:52094\n9 - 8 - 216.137.60.6:55852\n10 - 8 - 85.102.129.207:1713\n')
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
        assert.equal(results[0][1], '')
        assert.equal(results[1][1], '')

        // stdout
        assert.equal(results[0][0], '\n1 - 84 - 216.137.60.6\n2 - 52 - 54.239.167.74\n3 - 40 - 216.137.58.48\n4 - 38 - 95.7.142.5\n5 - 36 - 77.92.102.34\n6 - 24 - 54.239.171.99\n7 - 24 - 205.251.252.16\n8 - 22 - 54.240.156.59\n9 - 22 - 88.246.209.164\n10 - 22 - 95.14.129.124\n')
        assert.equal(results[1][0], '\n1 - 830 - 10.0.2.143\n2 - 506 - 10.0.0.215\n')

        done()
      })
    })

    it('multiple custom columns', function (done) {
      exec('node dist/cli.js logs/ --col1=total_time --col2=client:port', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 2.094293 - 205.251.252.16:5173\n2 - 2.094293 - 205.251.252.16:5173\n3 - 1.423956 - 85.107.47.8:20755\n4 - 1.423956 - 85.107.47.8:20755\n5 - 1.272112 - 54.240.156.59:63875\n6 - 1.272112 - 54.240.156.59:63875\n7 - 1.2584359999999999 - 54.240.145.65:64483\n8 - 1.2584359999999999 - 54.240.145.65:64483\n9 - 1.2089199999999998 - 54.240.145.65:50260\n10 - 1.2089199999999998 - 54.240.145.65:50260\n')
        done()
      })
    })

    it('multiple custom columns with sortBy', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --sortBy=2', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 2 - 95.9.8.42:49810 - 301\n2 - 2 - 95.70.131.112:38452 - 200\n3 - 2 - 95.7.60.91:38709 - 304\n4 - 2 - 95.7.142.5:1517 - 200\n5 - 2 - 95.7.142.5:1516 - 200\n6 - 2 - 95.7.142.5:1515 - 200\n7 - 2 - 95.7.142.5:1514 - 301\n8 - 2 - 95.7.142.5:1513 - 302\n9 - 2 - 95.7.142.5:1513 - 200\n10 - 2 - 95.7.142.5:1484 - 200\n')
        done()
      })
    })

    it('prefixing', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 12 - 95.15.16.130:58685 - 200\n2 - 10 - 95.14.129.124:49456 - 200\n3 - 8 - 95.14.129.124:49457 - 200\n4 - 6 - 95.10.99.215:2591 - 200\n5 - 6 - 95.7.142.5:1445 - 200\n6 - 4 - 95.65.184.99:52168 - 200\n7 - 4 - 95.7.142.5:1454 - 200\n8 - 4 - 95.7.142.5:1446 - 200\n9 - 4 - 95.7.142.5:1444 - 200\n10 - 2 - 95.13.202.204:35910 - 304\n')
        done()
      })
    })

    it('prefixing count field', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix1=1', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 12 - 95.15.16.130:58685 - 200\n2 - 12 - 216.137.58.48:40350 - 200\n3 - 10 - 216.137.60.6:28983 - 200\n4 - 10 - 95.14.129.124:49456 - 200\n5 - 10 - 77.92.102.34:4652 - 200\n')
        done()
      })
    })

    it('prefixing count field with sortBy', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix1=1 --sortBy=2 -a', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 12 - 216.137.58.48:40350 - 200\n2 - 10 - 216.137.60.6:28983 - 200\n3 - 10 - 77.92.102.34:4652 - 200\n4 - 10 - 95.14.129.124:49456 - 200\n5 - 12 - 95.15.16.130:58685 - 200\n')
        done()
      })
    })

    it('custom limits for the list', function (done) {
      exec('node dist/cli.js logs --limit=25', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 66 - http://example.com:80/images/trans.png\n2 - 66 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 58 - http://example.com:80/img/user/000000000000000000000000\n4 - 54 - http://www.example.com:80/favicon.ico\n5 - 46 - http://example.com:80/favicons/favicon-32x32.png\n6 - 38 - http://example.com:80/favicons/favicon-16x16.png\n7 - 32 - http://example.com:80/images/logo/devices.png\n8 - 30 - http://example.com:80/images/icon/collapse.png\n9 - 30 - http://example.com:80/\n10 - 30 - http://example.com:80/images/logo/google-play.png\n11 - 30 - http://example.com:80/images/logo/app-store.png\n12 - 28 - http://example.com:80/favicon.ico\n13 - 28 - http://example.com:80/favicons/favicon-192x192.png\n14 - 26 - http://example.com:80/stylesheets/external/font-awesome.css\n15 - 26 - http://example.com:80/favicons/favicon-160x160.png\n16 - 24 - http://example.com:80/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n17 - 24 - http://example.com:80/images/logo/example-o-logo.png\n18 - 24 - http://example.com:80/images/logo/example-new2x.png\n19 - 24 - http://example.com:80/favicons/favicon.ico\n20 - 22 - http://example.com:80/images/icon/article-comment-example.png\n21 - 20 - http://example.com:80/favicons/favicon-96x96.png\n22 - 14 - http://example.com:80/example-ozel/test-haberleri\n23 - 14 - https://example.com:443/?mode=json&after=&iteration=1\n24 - 12 - http://example.com:80/mobile/ios/sidemenu.json\n25 - 12 - http://ios.example.com:80/mobile/ios/register-push\n')
        done()
      })
    })

    it('custom limits with sortBy', function (done) {
      exec('node dist/cli.js logs --sortBy=2 --limit=20', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 2 - https://example.com:443/yasam/iliskiler-haberleri\n2 - 2 - https://example.com:443/videolar\n3 - 6 - https://example.com:443/stylesheets/external/font-awesome.css\n4 - 2 - https://example.com:443/profil/streetkedisi\n5 - 2 - https://example.com:443/profil/burak-gumus\n6 - 2 - https://example.com:443/profil/54f1f544105208421b6a4fe5\n7 - 2 - https://example.com:443/index.json?scope=galleries&after=1446725611907&iteration=4\n8 - 2 - https://example.com:443/index.json?scope=galleries&after=1446572248013&iteration=7\n9 - 10 - https://example.com:443/img/user/000000000000000000000000\n10 - 2 - https://example.com:443/images/trans.png\n11 - 2 - https://example.com:443/images/logo/example-o-logo.png\n12 - 6 - https://example.com:443/images/logo/example-new2x.png\n13 - 2 - https://example.com:443/images/icon/collapse.png\n14 - 2 - https://example.com:443/images/icon/article-comment-example.png\n15 - 2 - https://example.com:443/galeriler\n16 - 4 - https://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n17 - 2 - https://example.com:443/favicons/favicon.ico\n18 - 4 - https://example.com:443/favicons/favicon-96x96.png\n19 - 2 - https://example.com:443/favicons/favicon-32x32.png\n20 - 2 - https://example.com:443/favicons/favicon-192x192.png\n')
        done()
      })
    })

    it('custom limit with custom columns and prefixing', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95 --limit=5', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 12 - 95.15.16.130:58685 - 200\n2 - 10 - 95.14.129.124:49456 - 200\n3 - 8 - 95.14.129.124:49457 - 200\n4 - 6 - 95.10.99.215:2591 - 200\n5 - 6 - 95.7.142.5:1445 - 200\n')
        done()
      })
    })

    it('request more records than there are', function (done) {
      exec('node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95 --limit=5000', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 12 - 95.15.16.130:58685 - 200\n2 - 10 - 95.14.129.124:49456 - 200\n3 - 8 - 95.14.129.124:49457 - 200\n4 - 6 - 95.10.99.215:2591 - 200\n5 - 6 - 95.7.142.5:1445 - 200\n6 - 4 - 95.65.184.99:52168 - 200\n7 - 4 - 95.7.142.5:1454 - 200\n8 - 4 - 95.7.142.5:1446 - 200\n9 - 4 - 95.7.142.5:1444 - 200\n10 - 2 - 95.13.202.204:35910 - 304\n11 - 2 - 95.13.122.139:55645 - 200\n12 - 2 - 95.14.129.124:49512 - 302\n13 - 2 - 95.5.5.17:62820 - 302\n14 - 2 - 95.14.129.124:49512 - 200\n15 - 2 - 95.7.142.5:1513 - 302\n16 - 2 - 95.70.131.112:38452 - 200\n17 - 2 - 95.12.73.113:54944 - 301\n18 - 2 - 95.9.8.42:49810 - 301\n19 - 2 - 95.15.104.165:42512 - 301\n20 - 2 - 95.7.142.5:1517 - 200\n21 - 2 - 95.7.142.5:1516 - 200\n22 - 2 - 95.7.142.5:1515 - 200\n23 - 2 - 95.10.99.215:2590 - 200\n24 - 2 - 95.7.142.5:1514 - 301\n25 - 2 - 95.7.142.5:1513 - 200\n26 - 2 - 95.7.142.5:1484 - 200\n27 - 2 - 95.7.142.5:1483 - 200\n28 - 2 - 95.7.142.5:1482 - 200\n29 - 2 - 95.0.141.142:10023 - 200\n30 - 2 - 95.7.60.91:38709 - 304\n31 - 2 - 95.7.142.5:1480 - 200\n32 - 2 - 95.10.4.221:34614 - 200\n33 - 2 - 95.65.183.56:54479 - 302\n34 - 2 - 95.108.225.230:42116 - 200\n35 - 2 - 95.15.108.252:46888 - 301\n36 - 2 - 95.13.166.72:27286 - 302\n37 - 2 - 95.13.166.72:27241 - 304\n38 - 2 - 95.13.166.72:27225 - 304\n39 - 2 - 95.13.166.72:27152 - 304\n')
        done()
      })
    })

    it('filtering by date', function (done) {
      exec('node dist/cli.js logs/ --start=2015-11-07T18:45:34.501734Z --end=2015-11-07T18:45:34.768481Z', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 4 - http://example.com:80/images/logo/example-o-logo.png\n2 - 4 - http://example.com:80/images/logo/google-play.png\n3 - 4 - http://example.com:80/images/icon/collapse.png\n4 - 4 - http://example.com:80/images/logo/app-store.png\n5 - 4 - http://example.com:80/images/logo/devices.png\n6 - 4 - http://example.com:80/img/user/000000000000000000000000\n7 - 4 - http://example.com:80/favicon.ico\n8 - 2 - http://cf-source.example.com:80/img/719/bound/2r0/54b7cc86d22d31bf16a10f86.webp\n9 - 2 - http://cf-source.example.com:80/img/600/300/2r0/502a456a2ab3d1d03300af9a.jpg\n10 - 2 - http://cf-source.example.com:80/img/600/300/2r0/55f94dedf5ef747e16a4a640.jpg\n')
        done()
      })
    })

    it('filtering by date 2', function (done) {
      exec('node dist/cli.js logs/ --end=2015-11-07T18:45:35.368553Z', function (err, stdout) {
        assert.isNull(err)
        assert.equal(stdout, '\n1 - 30 - http://example.com:80/?mode=json&after=&iteration=1\n2 - 30 - http://example.com:80/img/user/000000000000000000000000\n3 - 22 - http://example.com:80/images/trans.png\n4 - 20 - http://example.com:80/images/icon/collapse.png\n5 - 18 - http://www.example.com:80/favicon.ico\n6 - 18 - http://example.com:80/\n7 - 16 - http://example.com:80/images/logo/app-store.png\n8 - 16 - http://example.com:80/favicons/favicon-32x32.png\n9 - 16 - http://example.com:80/stylesheets/external/font-awesome.css\n10 - 16 - http://example.com:80/images/logo/devices.png\n')
        done()
      })
    })
  });
});
