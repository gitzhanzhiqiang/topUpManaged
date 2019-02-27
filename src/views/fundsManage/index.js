import Template from '@src/template';
import userAccount from './userAccount';
import moneyRecord from './moneyRecord';

module.exports = {
    path: '/fundsManage',
    component: Template,
    meta: {
        title: '资金管理'
    },
    children: [
        {
            path: 'userAccount',
            name: 'fundsManage_userAccount',
            component: userAccount,
            meta: {
                title: '用户账户'
            }
        },
        {
            path: 'moneyRecord',
            name: 'fundsManage_moneyRecord',
            component: moneyRecord,
            meta: {
                title: '资金记录'
            }
        },
    ]
}