import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.options
 
import sockjs.tornado


class IndexHandler(tornado.web.RequestHandler):
    """Regular HTTP handler to serve the chatroom page"""
    def get(self):
        self.render('index.html')

class TestHandler(sockjs.tornado.SockJSConnection): 
    def open(self):
        print 'new connection'
        self.write_message("Hello World")
      
    def on_message(self, message):
        print 'message received %s' % message
 
    def on_close(self):
      print 'connection closed'
 

if __name__ == "__main__":
    import logging
    logging.getLogger().setLevel(logging.DEBUG)

    tornado.options.define("port", default=8081, type=int)

    # 1. Create weio router
    TestRouter = sockjs.tornado.SockJSRouter(TestHandler, '/test')

    # 2. Create Tornado application
    app = tornado.web.Application(
            list(TestRouter.urls) + 
            [(r"/", IndexHandler), (r"/(.*)", tornado.web.StaticFileHandler,
	 				{"path": ".", "default_filename": "index.html"})],
            debug=True)


    # 3. Make Tornado app listen on port 8080
    logging.info(" [*] Listening on 0.0.0.0:8081")

    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(tornado.options.options.port)

    # 4. Start IOLoop
    tornado.ioloop.IOLoop.instance().start()
