<template>
    <div class="app-container calendar-list-container ggg_user">
        <!-- 搜索条件 -->
        <el-form :inline="true" :model="params" ref="params" class="demo-form-inline" @keyup.enter.native="getTable('isseach')">
             <el-form-item label="当前页:" prop="pageIndex" v-show="false">
                <el-input v-model="params.pageIndex"></el-input>
            </el-form-item>
            <el-form-item label="行数:" prop="pageSize" v-show="false">
                <el-input v-model="params.pageSize"></el-input>
            </el-form-item>
            <el-form-item label="用户ID" prop="id">
                <el-input v-model="params.id" placeholder="请输入"></el-input>
            </el-form-item>
             <el-form-item label="账号名称" prop="username">
                <el-input v-model="params.username" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="params.status" placeholder="请选择">
                    <el-option v-for="item in status" :key="item.value" :label="item.key" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="解绑类型" prop="untieType">
                <el-select v-model="params.untieType" placeholder="请选择">
                    <el-option v-for="item in unbundleType" :key="item.value" :label="item.key" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" size="medium" icon="el-icon-search" @click="getTable('isseach')">查询</el-button>
                <el-button icon="el-icon-setting" size="medium" @click="resetForm('params')">重置</el-button>
            </el-form-item>
        </el-form>
        <div class="filter-container">
            <el-button-group>
                <el-button type="primary" size="medium" icon="el-icon-refresh" @click="getTable();">刷新</el-button>
                <el-button type="primary" size="medium" @click="download">导出</el-button>
            </el-button-group>
        </div>
        <!-- 列表 -->
        <div class="filter-container">
            <el-table :data="dataList" v-loading="listLoading" border fit highlight-current-row style="width: 100%">
                <el-table-column align="center" label="序号" width="70">
                    <template slot-scope="scope">
                         {{(params.pageIndex-1)*params.pageSize+parseInt(scope.$index) + 1}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="用户ID" width="">
                    <template slot-scope="scope">
                        {{scope.row.id}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="账号名称" width="">
                    <template slot-scope="scope">
                        {{scope.row.username}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="以太坊账号" width="">
                    <template slot-scope="scope">
                        {{scope.row.walletAddress}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="绑定时间" width="200">
                    <template slot-scope="scope">
                        {{scope.row.createTime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="解绑时间" width="200">
                    <template slot-scope="scope">
                        {{scope.row.applyUntieTime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="状态" width="100">
                    <template slot-scope="scope">
                        <span v-for="item in status" :key="item.value" v-text="item.key" v-show="item.value == scope.row.status"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="解绑类型" width="100">
                    <template slot-scope="scope">
                        <span v-for="item in unbundleType" :key="item.value" v-text="item.key" v-show="item.value == scope.row.untieType"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" fixed="right" width="200">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="lookOver(scope.row)">查看</el-button>
                        <el-button type="primary" size="mini" @click="unbundle(scope.row, 1)" v-if="scope.row.status == 1">解绑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 分页 -->
        <div v-if="total" class="pagination-container">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentPageChange" :current-page.sync="params.pageIndex" :page-sizes="[10,20,30, 50]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <el-dialog title="查看" :visible.sync="dialogVisible" width="45%">
            <el-form :model="alertFrom" ref="alertFrom" label-width="139">
                <el-tabs v-model="activeName">
                    <el-tab-pane label="基本信息" name="first">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="用户ID" prop="id">
                                    <el-input v-model="alertFrom.userCommonVo.id" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="账号名称" prop="username">
                                    <el-input v-model="alertFrom.userCommonVo.username" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="以太坊账号" prop="walletAddress">
                                    <el-input type="textarea" :rows="2" v-model="alertFrom.userCommonVo.walletAddress" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="注册来源" prop="source">
                                    <el-input v-model="alertFrom.userCommonVo.source" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="注册IP" prop="ip">
                                    <el-input v-model="alertFrom.userCommonVo.ip" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="注册时间" prop="createTime">
                                    <el-input v-model="alertFrom.userCommonVo.createTime" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="最后登录ip" prop="lastLoginIp">
                                    <el-input v-model="alertFrom.userCommonVo.lastLoginIp" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="最后登录时间" prop="lastLoginTime">
                                    <el-input v-model="alertFrom.userCommonVo.lastLoginTime" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="状态" prop="status">
                                    <el-input readonly v-for="item in storage.userStatus" :key="item.value" :value="item.key" v-show="alertFrom.userCommonVo.status == item.value"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="资金信息" name="second">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="账户平台币" prop="balance">
                                    <el-input v-model="alertFrom.userCommonVo.balance" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                               
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="总奖励平台币" prop="rewardCoins">
                                    <el-input v-model="alertFrom.userCommonVo.rewardCoins" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="总支出平台币" prop="payCoins">
                                    <el-input v-model="alertFrom.userCommonVo.payCoins" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="总兑换平台币" prop="exchangeCoins">
                                    <el-input v-model="alertFrom.userCommonVo.exchangeCoins" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="总提现平台币" prop="withdrawCoins">
                                    <el-input v-model="alertFrom.userCommonVo.withdrawCoins" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="以太坊账号" name="seconda">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="以太坊账号" prop="balance">
                                   <el-input type="textarea" :rows="2" v-model="alertFrom.userCommonVo.walletAddress" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="绑定时间" prop="createTime">
                                    <el-input v-model="alertFrom.createTime" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="解绑时间" prop="untieTime">
                                    <el-input v-model="alertFrom.untieTime" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="状态" prop="status">
                                    <el-input v-for='itm in status' :key="itm.value" :value="itm.key" v-show="alertFrom.status == itm.value" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="解绑类型" prop="untieType">
                                    <el-input v-for='itm in unbundleType' :key="itm.value" :value="itm.key" v-show="alertFrom.untieType == itm.value" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-tab-pane>   
                </el-tabs>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
import ajax from '@utils/config';
import { parseTime } from '@src/filters';
import { downloadExecl } from '@src/common/downloadExecl';
import { storage } from '@constants/dataStorage';
export default {
    data() {
        return {
            storage: storage,
            listLoading: false, //表格加载
            params: { //搜索条件
                 pageSize: 10,
                pageIndex: 1,
                id: '',
                username: '',
                status: '',
                untieType: '',
            },
            status: [ //状态
                { key: '使用中', value: '1' },
                { key: '已解绑', value: '2' },
            ],
            unbundleType: [ //解绑类型
                { key: '人工解绑', value: '1' },
            ],
            dataList: [true], //表格list
            total: 0,
            dialogVisible: false, // 查看
            activeName: 'first',
            alertFrom: {
                userCommonVo:'',
            }
        }
    },
    computed: {
    },
    created() {
        this.getTable();
    },
    mounted() {

    },
    methods: {
        //获取列表
        getTable(isSeach) {
            this.listLoading = true; //列表加载状态
            if (isSeach) {
                this.params.pageIndex = 1;
            }
            ajax({
                url: 'user/accountList',
                optionParams: this.params
            }).post()
                .then(response => {
                    if (response.code === 200) {
                        this.dataList = response.data.records ? response.data.records : [];
                        this.total = response.data.total;
                    } else {
                        this.$message({
                            message: response.msg,
                            type: 'warning'
                        });
                    }
                    this.listLoading = false; //列表加载状态
                })
                .catch(error => {
                    console.log(error);
                    this.listLoading = false; //列表加载状态
                })
        },
        download() {
            downloadExecl({ url: 'user/exportAccountList', input: this.params, method: 'get' })
        },
        lookOver(row) {
            this.activeName = 'first';
            this.dialogVisible = true;
            ajax({
                url: '/user/accountDetail/'+row.id,
                optionParams: {}
            }).fetch()
                .then(response => {
                    if (response.code === 200) {
                        this.alertFrom = response.data ? response.data : {};
                    } else {
                        this.$message({
                            message: response.msg,
                            type: 'warning'
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        },
        //解绑
        unbundle(row) {
            this.$confirm('解绑后不可撤销，请核对无误后操作！', '确认解绑？', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                ajax({
                    url: 'user/untieAccount',
                    optionParams: {
                        id: row.id
                    }
                }).post()
                    .then(response => {
                        if (response.code === 200) {
                            this.$message({
                                message: response.msg,
                                type: 'success'
                            });
                            this.getTable();
                        } else {
                            this.$message({
                                message: response.msg,
                                type: 'warning'
                            });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }).catch(() => {
            });
        },
        // 改变每一页的条数
        handleSizeChange(val) {
            this.params.pageSize = val;
            this.params.pageIndex = 1; //从第一页开始
            this.getTable();
        },
        // 切换页码
        handleCurrentPageChange(val) {
            this.params.pageIndex = val;
            this.getTable();
        },
        //重置表单
        resetForm(formName) {
            this.$refs[formName].resetFields();
        }

    },
    filters: {
    }
}
</script>
<style lang="less" scoped>

</style>


