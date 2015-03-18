import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.options
 
import sockjs.tornado
import json

WEIO_CONNECTION = None

class IndexHandler(tornado.web.RequestHandler):
    """Regular HTTP handler to serve the chatroom page"""
    def get(self):
        self.render('index.html')


class ApiHandler(sockjs.tornado.SockJSConnection): 
    def on_open(self, info):
        print 'new connection'
        self.send(json.dumps("Hello World"))
      
    def on_message(self, message):
        global WEIO_CONNECTION
        print 'message received %s' % message
        data = "BOOM!"
        print data
        if (WEIO_CONNECTION):
            print "Sending to WeIO..."
            #WEIO_CONNECTION.write_message(json.dumps(data))
            WEIO_CONNECTION.write_message(message)
        
 
    def on_close(self):
      print 'connection closed'


class WeioHandler(tornado.websocket.WebSocketHandler): 
    def open(self):
        global WEIO_CONNECTION
        print 'WeIO connection'
        self.write_message(json.dumps("Hello WeIO"))
        print self
        WEIO_CONNECTION = self
        print WEIO_CONNECTION
      
    def on_message(self, message):
        print 'WEIO: message received %s' % message
 
    def on_close(self):
      global WEIO_CONNECTION
      WEIO_CONNECTION = None
      print 'connection closed'

 

if __name__ == "__main__":
    import logging
    logging.getLogger().setLevel(logging.DEBUG)

    tornado.options.define("port", default=9090, type=int)

    # 1. Create API router
    ApiRouter = sockjs.tornado.SockJSRouter(ApiHandler, '/api')

    # 2. Create Tornado application
    app = tornado.web.Application(
            list(ApiRouter.urls) +
            [(r"/", IndexHandler),
                (r'/weio', WeioHandler),
                (r"/(.*)", tornado.web.StaticFileHandler, {"path": ".", "default_filename": "index.html"})
            ],
            debug=True)


    # 3. Make Tornado app listen on port 9090
    logging.info(" [*] Listening on 0.0.0.0:9090")

    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(tornado.options.options.port)

    # 4. Start IOLoop
    tornado.ioloop.IOLoop.instance().start()
