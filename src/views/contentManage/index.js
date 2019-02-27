import Template from '@src/template';
import articleManage from './articleManage';
module.exports = {
    path: '/contentManage',
    component: Template,
    meta: {
        title: '内容管理'
    },
    children: [
       
        {
            path: 'articleManage',
            name: 'contentManage_articleManage',
            component: articleManage,
            meta: {
                title: '文章管理'
            }
        }
    ]
}