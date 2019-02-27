import Template from '@src/template';
import push from './push';
import permissionsManage from './permissionsManage';
import messageTemplate from './messageTemplate';
import messagetem from './messagetem';
module.exports = {
    path: '/systemManage',
    component: Template,
    meta: {
        title: '系统管理'
    },
    children: [
        push,
        permissionsManage,
        {
            path: 'messageTemplate',
            name: 'systemManage_messageTemplate',
            component: messageTemplate,
            meta: {
                title: '系统类型管理'
            }
        },
         {
            path: 'messagetem',
            name: 'systemManage_messagetem',
            component: messagetem,
            meta: {
                title: '消息模板'
            }
        }
    ]
}