from __future__ import print_function
from bubamaraOCR import bubamaraGen as real_bubamara
import sys
import zerorpc


class BubamaraAPI(object):

    def bubamaraGen(self, file, storage, calibration):
#        """based on the input text, return the int result"""
        try:
            return real_bubamara(file, storage, calibration)
        except Exception as e:
            return 0.0
    def echo(self, text):
        """echo any text"""
        return text            

def parse_port():
    port = 4242
    try:
        port = int(sys.argv[1])
    except Exception as e:
        pass
    return '{}'.format(port)

def main():
    addr = 'tcp://127.0.0.1:' + parse_port()
    s = zerorpc.Server(BubamaraAPI())
    s.bind(addr)
    print('start running on {}'.format(addr))
    s.run()

if __name__ == '__main__':
    main()
