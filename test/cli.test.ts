import { exec, execSync } from 'child_process'

function cleanStdout(stdout: string) {
  return stdout.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  )
}

describe('cli mode', function() {
  it('should analyze directory', function(done) {
    exec('node dist/cli.js logs', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 99 - http://example.com:80/images/trans.png\n2 - 99 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 87 - http://example.com:80/img/user/000000000000000000000000\n4 - 81 - http://www.example.com:80/favicon.ico\n5 - 69 - http://example.com:80/favicons/favicon-32x32.png\n6 - 57 - http://example.com:80/favicons/favicon-16x16.png\n7 - 48 - http://example.com:80/images/logo/devices.png\n8 - 45 - http://example.com:80/images/icon/collapse.png\n9 - 45 - http://example.com:80/\n10 - 45 - http://example.com:80/images/logo/google-play.png\n'
      )
      done()
    })
  })

  it('should analyze a file', function(done) {
    exec('node dist/cli.js logs/AWSLogs.log', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 33 - http://example.com:80/images/trans.png\n2 - 33 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 29 - http://example.com:80/img/user/000000000000000000000000\n4 - 27 - http://www.example.com:80/favicon.ico\n5 - 23 - http://example.com:80/favicons/favicon-32x32.png\n6 - 19 - http://example.com:80/favicons/favicon-16x16.png\n7 - 16 - http://example.com:80/images/logo/devices.png\n8 - 15 - http://example.com:80/images/icon/collapse.png\n9 - 15 - http://example.com:80/\n10 - 15 - http://example.com:80/images/logo/google-play.png\n'
      )
      done()
    })
  })

  it('should analyze multiple files', function(done) {
    exec('node dist/cli.js logs/AWSLogs.log logs/inner-logs/AWSLogs2.log', function(
      err,
      stdout: string
    ) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 66 - http://example.com:80/images/trans.png\n2 - 66 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 58 - http://example.com:80/img/user/000000000000000000000000\n4 - 54 - http://www.example.com:80/favicon.ico\n5 - 46 - http://example.com:80/favicons/favicon-32x32.png\n6 - 38 - http://example.com:80/favicons/favicon-16x16.png\n7 - 32 - http://example.com:80/images/logo/devices.png\n8 - 30 - http://example.com:80/images/icon/collapse.png\n9 - 30 - http://example.com:80/\n10 - 30 - http://example.com:80/images/logo/google-play.png\n'
      )
      done()
    })
  })

  it('ascending order', function(done) {
    exec('node dist/cli.js logs -a', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 1 - http://example.com:443/yasam/iliskiler-haberleri\n2 - 1 - wss://example.com:443/favicons/apple-touch-icon-180x180.png\n3 - 1 - ws://example.com:443/favicons/favicon-32x32.png\n4 - 1 - http://example.com:443/stylesheets/external/font-awesome.css\n5 - 1 - http://example.com:443/favicons/favicon-16x16.png\n6 - 1 - h2://example.com:443/favicons/favicon-16x16.png\n7 - 1 - h2://example.com:443/favicons/favicon-96x96.png\n8 - 1 - h2://example.com:443/favicons/favicon-160x160.png\n9 - 1 - h2://example.com:443/favicons/favicon-192x192.png\n10 - 1 - ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n'
      )
      done()
    })
  })

  it('custom sortBy', function(done) {
    exec('node dist/cli.js logs --sortBy=2', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 1 - wss://example.com:443/index.json?scope=galleries&after=1446725611907&iteration=4\n2 - 1 - wss://example.com:443/favicons/apple-touch-icon-180x180.png\n3 - 1 - wss://example.com:443/?mode=json&after=1446874817085&iteration=1\n4 - 1 - wss://example.com:443/?mode=json&after=&iteration=1\n5 - 1 - ws://example.com:443/index.json?scope=galleries&after=1446572248013&iteration=7\n6 - 1 - ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n7 - 1 - ws://example.com:443/favicons/favicon-96x96.png\n8 - 1 - ws://example.com:443/favicons/favicon-32x32.png\n9 - 1 - ws://example.com:443/favicons/apple-touch-icon-180x180.png\n10 - 1 - ws://example.com:443/example-ozel/ilginc-haberleri/3\n'
      )
      done()
    })
  })

  it('custom sortBy ascending', function(done) {
    exec('node dist/cli.js logs --sortBy=2 -a', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 1 - h2://example.com:443/?mode=json&after=&iteration=1\n2 - 2 - h2://example.com:443/example-ozel/test-haberleri\n3 - 1 - h2://example.com:443/favicons/favicon-160x160.png\n4 - 1 - h2://example.com:443/favicons/favicon-16x16.png\n5 - 1 - h2://example.com:443/favicons/favicon-192x192.png\n6 - 1 - h2://example.com:443/favicons/favicon-96x96.png\n7 - 1 - h2://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n8 - 1 - h2://example.com:443/images/icon/article-comment-example.png\n9 - 2 - h2://example.com:443/images/logo/example-new2x.png\n10 - 3 - h2://example.com:443/img/user/000000000000000000000000\n'
      )
      done()
    })
  })

  it('custom column', function(done) {
    exec('node dist/cli.js logs/ --col2=client:port', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 18 - 95.15.16.130:58685\n2 - 18 - 216.137.58.48:40350\n3 - 18 - 216.137.60.6:14612\n4 - 15 - 216.137.60.6:28983\n5 - 15 - 95.14.129.124:49456\n6 - 15 - 216.137.60.6:61784\n7 - 15 - 77.92.102.34:4652\n8 - 12 - 195.142.92.249:52094\n9 - 12 - 216.137.60.6:55852\n10 - 12 - 85.102.129.207:1713\n'
      )
      done()
    })
  })

  it('custom column client and backend IPs w/o port', done => {
    const clientResult = execSync('node dist/cli.js logs/ --col2=client').toString()
    const backendResult = execSync('node dist/cli.js logs/ --col2=backend').toString()

    expect(clientResult).not.toBeUndefined()
    expect(backendResult).not.toBeUndefined()

    // stdout
    expect(cleanStdout(clientResult)).toBe(
      '1 - 126 - 216.137.60.6\n2 - 78 - 54.239.167.74\n3 - 60 - 216.137.58.48\n4 - 57 - 95.7.142.5\n5 - 54 - 77.92.102.34\n6 - 36 - 54.239.171.99\n7 - 36 - 205.251.252.16\n8 - 33 - 54.240.156.59\n9 - 33 - 88.246.209.164\n10 - 33 - 95.14.129.124\n'
    )
    expect(cleanStdout(backendResult)).toBe('1 - 1245 - 10.0.2.143\n2 - 759 - 10.0.0.215\n')

    done()
  })

  it('multiple custom columns', function(done) {
    exec('node dist/cli.js logs/ --col1=total_time --col2=client:port', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 2.094293 - 205.251.252.16:5173\n2 - 2.094293 - 205.251.252.16:5173\n3 - 2.094293 - 205.251.252.16:5173\n4 - 1.423956 - 85.107.47.8:20755\n5 - 1.423956 - 85.107.47.8:20755\n6 - 1.423956 - 85.107.47.8:20755\n7 - 1.272112 - 54.240.156.59:63875\n8 - 1.272112 - 54.240.156.59:63875\n9 - 1.272112 - 54.240.156.59:63875\n10 - 1.2584359999999999 - 54.240.145.65:64483\n'
      )
      done()
    })
  })

  it('multiple custom columns with sortBy', function(done) {
    exec(
      'node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --sortBy=2',
      function(err, stdout) {
        expect(err).toBeNull()
        expect(cleanStdout(stdout)).toBe(
          '1 - 3 - 95.9.8.42:49810 - 301\n2 - 3 - 95.70.131.112:38452 - 200\n3 - 3 - 95.7.60.91:38709 - 304\n4 - 3 - 95.7.142.5:1517 - 200\n5 - 3 - 95.7.142.5:1516 - 200\n6 - 3 - 95.7.142.5:1515 - 200\n7 - 3 - 95.7.142.5:1514 - 301\n8 - 3 - 95.7.142.5:1513 - 302\n9 - 3 - 95.7.142.5:1513 - 200\n10 - 3 - 95.7.142.5:1484 - 200\n'
        )
        done()
      }
    )
  })

  it('prefixing', function(done) {
    exec(
      'node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95',
      function(err, stdout) {
        expect(err).toBeNull()
        expect(cleanStdout(stdout)).toBe(
          '1 - 18 - 95.15.16.130:58685 - 200\n2 - 15 - 95.14.129.124:49456 - 200\n3 - 12 - 95.14.129.124:49457 - 200\n4 - 9 - 95.10.99.215:2591 - 200\n5 - 9 - 95.7.142.5:1445 - 200\n6 - 6 - 95.65.184.99:52168 - 200\n7 - 6 - 95.7.142.5:1454 - 200\n8 - 6 - 95.7.142.5:1446 - 200\n9 - 6 - 95.7.142.5:1444 - 200\n10 - 3 - 95.13.202.204:35910 - 304\n'
        )
        done()
      }
    )
  })

  it('prefixing count field', function(done) {
    exec(
      'node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix1=1',
      function(err, stdout) {
        expect(err).toBeNull()
        expect(cleanStdout(stdout)).toBe(
          '1 - 18 - 95.15.16.130:58685 - 200\n2 - 18 - 216.137.58.48:40350 - 200\n3 - 15 - 216.137.60.6:28983 - 200\n4 - 15 - 95.14.129.124:49456 - 200\n5 - 15 - 77.92.102.34:4652 - 200\n6 - 12 - 195.142.92.249:52094 - 200\n7 - 12 - 85.102.129.207:1713 - 200\n8 - 12 - 85.102.129.207:1714 - 200\n9 - 12 - 216.137.60.6:61784 - 200\n10 - 12 - 54.240.156.59:62545 - 200\n'
        )
        done()
      }
    )
  })

  it('prefixing count field with sortBy', function(done) {
    exec(
      'node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix1=1 --sortBy=2 -a',
      function(err, stdout) {
        expect(err).toBeNull()
        expect(cleanStdout(stdout)).toBe(
          '1 - 12 - 195.142.92.249:52094 - 200\n2 - 18 - 216.137.58.48:40350 - 200\n3 - 12 - 216.137.60.6:14612 - 200\n4 - 15 - 216.137.60.6:28983 - 200\n5 - 12 - 216.137.60.6:29161 - 200\n6 - 12 - 216.137.60.6:61784 - 200\n7 - 12 - 54.240.156.59:62545 - 200\n8 - 15 - 77.92.102.34:4652 - 200\n9 - 12 - 85.102.129.207:1713 - 200\n10 - 12 - 85.102.129.207:1714 - 200\n'
        )
        done()
      }
    )
  })

  it('custom limits for the list', function(done) {
    exec('node dist/cli.js logs --limit=25', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 99 - http://example.com:80/images/trans.png\n2 - 99 - http://example.com:80/?mode=json&after=&iteration=1\n3 - 87 - http://example.com:80/img/user/000000000000000000000000\n4 - 81 - http://www.example.com:80/favicon.ico\n5 - 69 - http://example.com:80/favicons/favicon-32x32.png\n6 - 57 - http://example.com:80/favicons/favicon-16x16.png\n7 - 48 - http://example.com:80/images/logo/devices.png\n8 - 45 - http://example.com:80/images/icon/collapse.png\n9 - 45 - http://example.com:80/\n10 - 45 - http://example.com:80/images/logo/google-play.png\n11 - 45 - http://example.com:80/images/logo/app-store.png\n12 - 42 - http://example.com:80/favicon.ico\n13 - 42 - http://example.com:80/favicons/favicon-192x192.png\n14 - 39 - http://example.com:80/stylesheets/external/font-awesome.css\n15 - 39 - http://example.com:80/favicons/favicon-160x160.png\n16 - 36 - http://example.com:80/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n17 - 36 - http://example.com:80/images/logo/example-o-logo.png\n18 - 36 - http://example.com:80/images/logo/example-new2x.png\n19 - 36 - http://example.com:80/favicons/favicon.ico\n20 - 33 - http://example.com:80/images/icon/article-comment-example.png\n21 - 30 - http://example.com:80/favicons/favicon-96x96.png\n22 - 21 - http://example.com:80/example-ozel/test-haberleri\n23 - 18 - http://example.com:80/mobile/ios/sidemenu.json\n24 - 18 - http://ios.example.com:80/mobile/ios/register-push\n25 - 16 - https://example.com:443/?mode=json&after=&iteration=1\n'
      )
      done()
    })
  })

  it('custom limits with sortBy', function(done) {
    exec('node dist/cli.js logs --sortBy=2 --limit=20', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 1 - wss://example.com:443/index.json?scope=galleries&after=1446725611907&iteration=4\n2 - 1 - wss://example.com:443/favicons/apple-touch-icon-180x180.png\n3 - 1 - wss://example.com:443/?mode=json&after=1446874817085&iteration=1\n4 - 1 - wss://example.com:443/?mode=json&after=&iteration=1\n5 - 1 - ws://example.com:443/index.json?scope=galleries&after=1446572248013&iteration=7\n6 - 1 - ws://example.com:443/fonts/font-awesome-4.0.3/fontawesome-webfont.woff?v=4.0.3\n7 - 1 - ws://example.com:443/favicons/favicon-96x96.png\n8 - 1 - ws://example.com:443/favicons/favicon-32x32.png\n9 - 1 - ws://example.com:443/favicons/apple-touch-icon-180x180.png\n10 - 1 - ws://example.com:443/example-ozel/ilginc-haberleri/3\n11 - 1 - ws://example.com:443/ara?q=bebek\n12 - 1 - ws://example.com:443/api/category/headerlisting\n13 - 1 - ws://example.com:443/?mode=json&after=1446874817085&iteration=1\n14 - 1 - ws://example.com:443/?mode=json&after=&iteration=1\n15 - 2 - https://example.com:443/yasam/iliskiler-haberleri\n16 - 2 - https://example.com:443/videolar\n17 - 7 - https://example.com:443/stylesheets/external/font-awesome.css\n18 - 2 - https://example.com:443/profil/streetkedisi\n19 - 2 - https://example.com:443/profil/burak-gumus\n20 - 2 - https://example.com:443/profil/54f1f544105208421b6a4fe5\n'
      )
      done()
    })
  })

  it('custom limit with custom columns and prefixing', function(done) {
    exec(
      'node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95 --limit=5',
      function(err, stdout) {
        expect(err).toBeNull()
        expect(cleanStdout(stdout)).toBe(
          '1 - 18 - 95.15.16.130:58685 - 200\n2 - 15 - 95.14.129.124:49456 - 200\n3 - 12 - 95.14.129.124:49457 - 200\n4 - 9 - 95.10.99.215:2591 - 200\n5 - 9 - 95.7.142.5:1445 - 200\n'
        )
        done()
      }
    )
  })

  it('request more records than there are', function(done) {
    exec(
      'node dist/cli.js logs/ --col1=count --col2=client:port --col3=elb_status_code --prefix2=95 --limit=5000',
      function(err, stdout) {
        expect(err).toBeNull()
        expect(cleanStdout(stdout)).toBe(
          '1 - 18 - 95.15.16.130:58685 - 200\n2 - 15 - 95.14.129.124:49456 - 200\n3 - 12 - 95.14.129.124:49457 - 200\n4 - 9 - 95.10.99.215:2591 - 200\n5 - 9 - 95.7.142.5:1445 - 200\n6 - 6 - 95.65.184.99:52168 - 200\n7 - 6 - 95.7.142.5:1454 - 200\n8 - 6 - 95.7.142.5:1446 - 200\n9 - 6 - 95.7.142.5:1444 - 200\n10 - 3 - 95.13.202.204:35910 - 304\n11 - 3 - 95.13.122.139:55645 - 200\n12 - 3 - 95.14.129.124:49512 - 302\n13 - 3 - 95.5.5.17:62820 - 302\n14 - 3 - 95.14.129.124:49512 - 200\n15 - 3 - 95.7.142.5:1513 - 302\n16 - 3 - 95.70.131.112:38452 - 200\n17 - 3 - 95.12.73.113:54944 - 301\n18 - 3 - 95.9.8.42:49810 - 301\n19 - 3 - 95.15.104.165:42512 - 301\n20 - 3 - 95.7.142.5:1517 - 200\n21 - 3 - 95.7.142.5:1516 - 200\n22 - 3 - 95.7.142.5:1515 - 200\n23 - 3 - 95.10.99.215:2590 - 200\n24 - 3 - 95.7.142.5:1514 - 301\n25 - 3 - 95.7.142.5:1513 - 200\n26 - 3 - 95.7.142.5:1484 - 200\n27 - 3 - 95.7.142.5:1483 - 200\n28 - 3 - 95.7.142.5:1482 - 200\n29 - 3 - 95.0.141.142:10023 - 200\n30 - 3 - 95.7.60.91:38709 - 304\n31 - 3 - 95.7.142.5:1480 - 200\n32 - 3 - 95.10.4.221:34614 - 200\n33 - 3 - 95.65.183.56:54479 - 302\n34 - 3 - 95.108.225.230:42116 - 200\n35 - 3 - 95.15.108.252:46888 - 301\n36 - 3 - 95.13.166.72:27286 - 302\n37 - 3 - 95.13.166.72:27241 - 304\n38 - 3 - 95.13.166.72:27225 - 304\n39 - 3 - 95.13.166.72:27152 - 304\n'
        )
        done()
      }
    )
  })

  it('filtering by date', function(done) {
    exec(
      'node dist/cli.js logs/ --start=2015-11-07T18:45:34.501734Z --end=2015-11-07T18:45:34.768481Z',
      function(err, stdout) {
        expect(err).toBeNull()
        expect(cleanStdout(stdout)).toBe(
          '1 - 6 - http://example.com:80/images/logo/example-o-logo.png\n2 - 6 - http://example.com:80/images/logo/google-play.png\n3 - 6 - http://example.com:80/images/icon/collapse.png\n4 - 6 - http://example.com:80/images/logo/app-store.png\n5 - 6 - http://example.com:80/images/logo/devices.png\n6 - 6 - http://example.com:80/img/user/000000000000000000000000\n7 - 6 - http://example.com:80/favicon.ico\n8 - 3 - http://cf-source.example.com:80/img/719/bound/2r0/54b7cc86d22d31bf16a10f86.webp\n9 - 3 - http://cf-source.example.com:80/img/600/300/2r0/502a456a2ab3d1d03300af9a.jpg\n10 - 3 - http://cf-source.example.com:80/img/600/300/2r0/55f94dedf5ef747e16a4a640.jpg\n'
        )
        done()
      }
    )
  })

  it('filtering by date 2', function(done) {
    exec('node dist/cli.js logs/ --end=2015-11-07T18:45:35.368553Z', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 45 - http://example.com:80/?mode=json&after=&iteration=1\n2 - 45 - http://example.com:80/img/user/000000000000000000000000\n3 - 33 - http://example.com:80/images/trans.png\n4 - 30 - http://example.com:80/images/icon/collapse.png\n5 - 27 - http://www.example.com:80/favicon.ico\n6 - 27 - http://example.com:80/\n7 - 24 - http://example.com:80/images/logo/app-store.png\n8 - 24 - http://example.com:80/favicons/favicon-32x32.png\n9 - 24 - http://example.com:80/stylesheets/external/font-awesome.css\n10 - 24 - http://example.com:80/images/logo/devices.png\n'
      )
      done()
    })
  })

  it('should parse application ELB logs as well', function(done) {
    exec('node dist/cli.js logs/AppELBLog.log --col2=type', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 219 - http\n2 - 161 - h2\n3 - 148 - https\n4 - 71 - ws\n5 - 69 - wss\n'
      )
      done()
    })
  })

  it('should parse application ELB logs in directory as well', function(done) {
    exec('node dist/cli.js logs --col2=type', function(err, stdout) {
      expect(err).toBeNull()
      expect(cleanStdout(stdout)).toBe(
        '1 - 219 - http\n2 - 161 - h2\n3 - 148 - https\n4 - 71 - ws\n5 - 69 - wss\n'
      )
      done()
    })
  })

  it('should parse separate requested_resource fields', () => {
    const result = execSync('node dist/cli.js logs --col2=requested_resource.host').toString()

    expect(cleanStdout(result)).toBe(
      '1 - 1209 - example.com:80\n2 - 507 - cf-source.example.com:80\n3 - 174 - example.com:443\n4 - 87 - www.example.com:80\n5 - 18 - ios.example.com:80\n6 - 9 - examp.le:80\n'
    )
  })
})
