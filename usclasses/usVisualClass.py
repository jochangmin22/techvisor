from ipclasses import IpVisual
from usclasses import UsSearchs

class UsVisual(IpVisual):
    
    def visual(self):            
        foo = UsSearchs(self._request, mode=self._mode)
       
        command = { 
            'visualNum' : foo.vis_num,
            'visualClassify' : foo.vis_cla,
            'visualIpc' : foo.vis_ipc,
            'visualPerson' : foo.vis_per
        }   

        return command[self._mode]()
