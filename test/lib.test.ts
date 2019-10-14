import analyzer from '../dist/lib'

describe('library mode', function() {
  it('should analyze directory', function(done) {
    var result = [
      [99, 'http://example.com:80/images/trans.png'],
      [99, 'http://example.com:80/?mode=json&after=&iteration=1'],
      [87, 'http://example.com:80/img/user/000000000000000000000000'],
      [81, 'http://www.example.com:80/favicon.ico'],
      [69, 'http://example.com:80/favicons/favicon-32x32.png'],
      [57, 'http://example.com:80/favicons/favicon-16x16.png'],
      [48, 'http://example.com:80/images/logo/devices.png'],
      [45, 'http://example.com:80/images/icon/collapse.png'],
      [45, 'http://example.com:80/'],
      [45, 'http://example.com:80/images/logo/google-play.png'],
    ]

    analyzer({
      files: ['./logs'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('should analyze a file', function(done) {
    var result = [
      [33, 'http://example.com:80/images/trans.png'],
      [33, 'http://example.com:80/?mode=json&after=&iteration=1'],
      [29, 'http://example.com:80/img/user/000000000000000000000000'],
      [27, 'http://www.example.com:80/favicon.ico'],
      [23, 'http://example.com:80/favicons/favicon-32x32.png'],
      [19, 'http://example.com:80/favicons/favicon-16x16.png'],
      [16, 'http://example.com:80/images/logo/devices.png'],
      [15, 'http://example.com:80/images/icon/collapse.png'],
      [15, 'http://example.com:80/'],
      [15, 'http://example.com:80/images/logo/google-play.png'],
    ]

    analyzer({
      files: ['./logs/AWSLogs.log'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('should analyze multiple files', function(done) {
    var result = [
      [66, 'http://example.com:80/images/trans.png'],
      [66, 'http://example.com:80/?mode=json&after=&iteration=1'],
      [58, 'http://example.com:80/img/user/000000000000000000000000'],
      [54, 'http://www.example.com:80/favicon.ico'],
      [46, 'http://example.com:80/favicons/favicon-32x32.png'],
      [38, 'http://example.com:80/favicons/favicon-16x16.png'],
      [32, 'http://example.com:80/images/logo/devices.png'],
      [30, 'http://example.com:80/images/icon/collapse.png'],
      [30, 'http://example.com:80/'],
      [30, 'http://example.com:80/images/logo/google-play.png'],
    ]

    analyzer({
      files: ['logs/AWSLogs.log', 'logs/inner-logs/AWSLogs2.log'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('ascending order', function(done) {
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
    ]

    analyzer({
      files: ['logs'],
      ascending: true,
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('custom sortBy', function(done) {
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
    ]

    analyzer({
      files: ['logs'],
      sortBy: 1,
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('custom sortBy ascending', function(done) {
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
    ]

    analyzer({
      files: ['logs'],
      ascending: true,
      sortBy: 1,
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('custom column', function(done) {
    var result = [
      [18, '95.15.16.130:58685'],
      [18, '216.137.58.48:40350'],
      [18, '216.137.60.6:14612'],
      [15, '216.137.60.6:28983'],
      [15, '95.14.129.124:49456'],
      [15, '216.137.60.6:61784'],
      [15, '77.92.102.34:4652'],
      [12, '195.142.92.249:52094'],
      [12, '216.137.60.6:55852'],
      [12, '85.102.129.207:1713'],
    ]

    analyzer({
      files: ['logs'],
      cols: ['count', 'client:port'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('custom column client and backend IPs w/o port', function(done) {
    var result1 = [
      [126, '216.137.60.6'],
      [78, '54.239.167.74'],
      [60, '216.137.58.48'],
      [57, '95.7.142.5'],
      [54, '77.92.102.34'],
      [36, '54.239.171.99'],
      [36, '205.251.252.16'],
      [33, '54.240.156.59'],
      [33, '88.246.209.164'],
      [33, '95.14.129.124'],
    ]
    var result2 = [[1245, '10.0.2.143'], [759, '10.0.0.215']]

    Promise.all([
      analyzer({
        files: ['logs'],
        cols: ['count', 'client'],
      }),

      analyzer({
        files: ['logs'],
        cols: ['count', 'backend'],
      }),
    ]).then(function(logs) {
      logs[0].forEach(function(log, i) {
        expect(result1[i][0]).toBe(log[0])
        expect(result1[i][1]).toBe(log[1])
      })

      logs[1].forEach(function(log, i) {
        expect(result2[i][0]).toBe(log[0])
        expect(result2[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('multiple custom columns', function(done) {
    var result = [
      [2.094293, '205.251.252.16:5173'],
      [2.094293, '205.251.252.16:5173'],
      [2.094293, '205.251.252.16:5173'],
      [1.423956, '85.107.47.8:20755'],
      [1.423956, '85.107.47.8:20755'],
      [1.423956, '85.107.47.8:20755'],
      [1.272112, '54.240.156.59:63875'],
      [1.272112, '54.240.156.59:63875'],
      [1.272112, '54.240.156.59:63875'],
      [1.2584359999999999, '54.240.145.65:64483'],
    ]

    analyzer({
      files: ['logs'],
      cols: ['total_time', 'client:port'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('multiple custom columns with sortBy', function(done) {
    var result = [
      [3, '95.9.8.42:49810', '301'],
      [3, '95.70.131.112:38452', '200'],
      [3, '95.7.60.91:38709', '304'],
      [3, '95.7.142.5:1517', '200'],
      [3, '95.7.142.5:1516', '200'],
      [3, '95.7.142.5:1515', '200'],
      [3, '95.7.142.5:1514', '301'],
      [3, '95.7.142.5:1513', '302'],
      [3, '95.7.142.5:1513', '200'],
      [3, '95.7.142.5:1484', '200'],
    ]

    analyzer({
      files: ['logs'],
      cols: ['count', 'client:port', 'elb_status_code'],
      sortBy: 1,
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('prefixing', function(done) {
    var result = [
      [18, '95.15.16.130:58685', '200'],
      [15, '95.14.129.124:49456', '200'],
      [12, '95.14.129.124:49457', '200'],
      [9, '95.10.99.215:2591', '200'],
      [9, '95.7.142.5:1445', '200'],
      [6, '95.65.184.99:52168', '200'],
      [6, '95.7.142.5:1454', '200'],
      [6, '95.7.142.5:1446', '200'],
      [6, '95.7.142.5:1444', '200'],
      [3, '95.13.202.204:35910', '304'],
    ]

    analyzer({
      files: ['logs'],
      cols: ['count', 'client:port', 'elb_status_code'],
      prefixes: ['', '95'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('prefixing count field', function(done) {
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
    ]

    analyzer({
      files: ['logs'],
      cols: ['count', 'client:port', 'elb_status_code'],
      prefixes: ['1'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('prefixing count field with sortBy', function(done) {
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
    ]

    analyzer({
      files: ['logs'],
      cols: ['count', 'client:port', 'elb_status_code'],
      prefixes: ['1'],
      sortBy: 1,
      ascending: true,
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('custom limits for the list', function(done) {
    var result = [
      [99, 'http://example.com:80/images/trans.png'],
      [99, 'http://example.com:80/?mode=json&after=&iteration=1'],
      [87, 'http://example.com:80/img/user/000000000000000000000000'],
      [81, 'http://www.example.com:80/favicon.ico'],
      [69, 'http://example.com:80/favicons/favicon-32x32.png'],
      [57, 'http://example.com:80/favicons/favicon-16x16.png'],
      [48, 'http://example.com:80/images/logo/devices.png'],
      [45, 'http://example.com:80/images/icon/collapse.png'],
      [45, 'http://example.com:80/'],
      [45, 'http://example.com:80/images/logo/google-play.png'],
      [45, 'http://example.com:80/images/logo/app-store.png'],
      [42, 'http://example.com:80/favicon.ico'],
      [42, 'http://example.com:80/favicons/favicon-192x192.png'],
      [39, 'http://example.com:80/stylesheets/external/font-awesome.css'],
      [39, 'http://example.com:80/favicons/favicon-160x160.png'],
      [36, 'http://example.com:80/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3'],
      [36, 'http://example.com:80/images/logo/example-o-logo.png'],
      [36, 'http://example.com:80/images/logo/example-new2x.png'],
      [36, 'http://example.com:80/favicons/favicon.ico'],
      [33, 'http://example.com:80/images/icon/article-comment-example.png'],
      [30, 'http://example.com:80/favicons/favicon-96x96.png'],
      [21, 'http://example.com:80/example-ozel/test-haberleri'],
      [18, 'http://example.com:80/mobile/ios/sidemenu.json'],
      [18, 'http://ios.example.com:80/mobile/ios/register-push'],
      [16, 'https://example.com:443/?mode=json&after=&iteration=1'],
    ]

    analyzer({
      files: ['logs'],
      limit: 25,
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('custom limits with sortBy', function(done) {
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
    ]

    analyzer({
      files: ['logs'],
      limit: 20,
      sortBy: 1,
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('custom limit with custom columns and prefixing', function(done) {
    var result = [
      [18, '95.15.16.130:58685', '200'],
      [18, '216.137.58.48:40350', '200'],
      [15, '216.137.60.6:28983', '200'],
      [15, '95.14.129.124:49456', '200'],
      [15, '77.92.102.34:4652', '200'],
    ]

    analyzer({
      files: ['logs'],
      limit: 5,
      cols: ['count', 'client:port', 'elb_status_code'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('request more records than there are', function(done) {
    var result = [
      [18, '95.15.16.130:58685', '200'],
      [15, '95.14.129.124:49456', '200'],
      [12, '95.14.129.124:49457', '200'],
      [9, '95.10.99.215:2591', '200'],
      [9, '95.7.142.5:1445', '200'],
      [6, '95.65.184.99:52168', '200'],
      [6, '95.7.142.5:1454', '200'],
      [6, '95.7.142.5:1446', '200'],
      [6, '95.7.142.5:1444', '200'],
      [3, '95.13.202.204:35910', '304'],
      [3, '95.13.122.139:55645', '200'],
      [3, '95.14.129.124:49512', '302'],
      [3, '95.5.5.17:62820', '302'],
      [3, '95.14.129.124:49512', '200'],
      [3, '95.7.142.5:1513', '302'],
      [3, '95.70.131.112:38452', '200'],
      [3, '95.12.73.113:54944', '301'],
      [3, '95.9.8.42:49810', '301'],
      [3, '95.15.104.165:42512', '301'],
      [3, '95.7.142.5:1517', '200'],
      [3, '95.7.142.5:1516', '200'],
      [3, '95.7.142.5:1515', '200'],
      [3, '95.10.99.215:2590', '200'],
      [3, '95.7.142.5:1514', '301'],
      [3, '95.7.142.5:1513', '200'],
      [3, '95.7.142.5:1484', '200'],
      [3, '95.7.142.5:1483', '200'],
      [3, '95.7.142.5:1482', '200'],
      [3, '95.0.141.142:10023', '200'],
      [3, '95.7.60.91:38709', '304'],
      [3, '95.7.142.5:1480', '200'],
      [3, '95.10.4.221:34614', '200'],
      [3, '95.65.183.56:54479', '302'],
      [3, '95.108.225.230:42116', '200'],
      [3, '95.15.108.252:46888', '301'],
      [3, '95.13.166.72:27286', '302'],
      [3, '95.13.166.72:27241', '304'],
      [3, '95.13.166.72:27225', '304'],
      [3, '95.13.166.72:27152', '304'],
    ]

    analyzer({
      files: ['logs'],
      limit: 5000,
      cols: ['count', 'client:port', 'elb_status_code'],
      prefixes: ['', '95'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('filtering by date', function(done) {
    var result = [
      [6, 'http://example.com:80/images/logo/example-o-logo.png'],
      [6, 'http://example.com:80/images/logo/google-play.png'],
      [6, 'http://example.com:80/images/icon/collapse.png'],
      [6, 'http://example.com:80/images/logo/app-store.png'],
      [6, 'http://example.com:80/images/logo/devices.png'],
      [6, 'http://example.com:80/img/user/000000000000000000000000'],
      [6, 'http://example.com:80/favicon.ico'],
      [3, 'http://cf-source.example.com:80/img/719/bound/2r0/54b7cc86d22d31bf16a10f86.webp'],
      [3, 'http://cf-source.example.com:80/img/600/300/2r0/502a456a2ab3d1d03300af9a.jpg'],
      [3, 'http://cf-source.example.com:80/img/600/300/2r0/55f94dedf5ef747e16a4a640.jpg'],
    ]

    analyzer({
      files: ['logs'],
      start: new Date('2015-11-07T18:45:34.501734Z'),
      end: new Date('2015-11-07T18:45:34.768481Z'),
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('filtering by date 2', function(done) {
    var result = [
      [45, 'http://example.com:80/?mode=json&after=&iteration=1'],
      [45, 'http://example.com:80/img/user/000000000000000000000000'],
      [33, 'http://example.com:80/images/trans.png'],
      [30, 'http://example.com:80/images/icon/collapse.png'],
      [27, 'http://www.example.com:80/favicon.ico'],
      [27, 'http://example.com:80/'],
      [24, 'http://example.com:80/images/logo/app-store.png'],
      [24, 'http://example.com:80/favicons/favicon-32x32.png'],
      [24, 'http://example.com:80/stylesheets/external/font-awesome.css'],
      [24, 'http://example.com:80/images/logo/devices.png'],
    ]

    analyzer({
      files: ['logs'],
      end: new Date('2015-11-07T18:45:35.368553Z'),
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('should parse application ELB logs as well', function(done) {
    var result = [[219, 'http'], [161, 'h2'], [148, 'https'], [71, 'ws'], [69, 'wss']]

    analyzer({
      files: ['logs/AppELBLog.log'],
      cols: ['count', 'type'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })

  it('should parse application ELB logs in directory as well', function(done) {
    var result = [[219, 'http'], [161, 'h2'], [148, 'https'], [71, 'ws'], [69, 'wss']]

    analyzer({
      files: ['logs'],
      cols: ['count', 'type'],
    }).then(function(logs) {
      logs.forEach(function(log, i) {
        expect(result[i][0]).toBe(log[0])
        expect(result[i][1]).toBe(log[1])
      })
      done()
    })
  })
})
