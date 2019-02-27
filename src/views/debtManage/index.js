import Template from '@src/template';
import appealManage from './appealManage';
module.exports = {
    path: '/debtManage',
    component: Template,
    meta: {
        title: '债权管理'
    },
    children: [
        {
            path: 'appealManage',
            name: 'debtManage_appealManage',
            component: appealManage,
            meta: {
                title: '申诉管理'
            }
        },
       
    ]
}