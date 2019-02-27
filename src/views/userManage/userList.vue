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
            <el-form-item label="客户端类型" prop="source">
                <el-select v-model="params.source" placeholder="请选择">
                    <el-option v-for="item in storage.source" :key="item.value" :label="item.key" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="用户状态" prop="status">
                <el-select v-model="params.status" placeholder="请选择">
                    <el-option v-for="item in storage.userStatus" :key="item.value" :label="item.key" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="注册时间" prop="date">
                <el-date-picker v-model="params.date" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
                </el-date-picker>
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
                <el-table-column align="center" label="注册来源" width="">
                    <template slot-scope="scope">
                        <span v-for="item in storage.source" :key="item.value" v-text="item.key" v-show="item.value == scope.row.source"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="注册时间" width="200">
                    <template slot-scope="scope">
                        {{scope.row.createTime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="最后登录时间" width="200">
                    <template slot-scope="scope">
                        {{scope.row.lastLoginTime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="用户状态" width="100">
                    <template slot-scope="scope">
                        <span v-for="item in storage.userStatus" :key="item.value" v-text="item.key" v-show="item.value == scope.row.status"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" >
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="lookOver(scope.row)">查看</el-button>
                        <el-button type="primary" size="mini" v-if="scope.row.status == 1" @click="forbidden(scope.row)">禁用</el-button>
                        <el-button size="mini" @click="forbidden(scope.row)" v-else>启用</el-button>
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
                                    <el-input v-model="alertFrom.userCommonVo.walletAddress" readonly></el-input>
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
                    <el-tab-pane label="密保问题" name="seconda">
                        <el-row :gutter="20" v-for = 'itm in alertFrom.questions'>
                            <el-col :span="12">
                                <el-form-item label="密保问题：" prop="question">
                                    <el-input v-model="itm.question" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="密保回答：" prop="answer">
                                    <el-input v-model="itm.answer" readonly></el-input>
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
import { storage } from '@constants/dataStorage';
import { downloadExecl } from '@src/common/downloadExecl';
export default {
    data() {
        return {
            listLoading: false, //表格加载
            storage: storage,
            params: { //搜索条件
               pageSize: 10,
                pageIndex: 1,
                id: '',
                username:'',
                source: '', //客户端
                status: '', //状态
                date: [],
                beginTime: '',
                endTime: '',
            },
            dataList: [true], //表格list
            total: 0,
            dialogVisible: false, // 查看
            activeName: 'first',
            alertFrom: {
                questions:[],
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
            let date = this.params.date ? this.params.date : []; //时间控件清除为null
            this.params.beginTime = parseTime(date[0], '{y}-{m}-{d} {h}:{i}:{s}');
            this.params.endTime = parseTime(date[1], '{y}-{m}-{d} {h}:{i}:{s}');
            console.log(this.params)
            ajax({
                url: 'user/userList',
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
            downloadExecl({ url: 'user/exportUserList', input: this.params, method: 'get' })
        },
        lookOver(row) {
            this.activeName = 'first';
            this.dialogVisible = true;
            ajax({
                url: '/user/userDetail/'+row.id,
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
        //禁用
        forbidden(row) {
            let text = row.status == 1 ? '禁用' : '启用';
            this.$confirm('确定' + text + '吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                ajax({
                    url: 'user/changeUser',
                    optionParams: {
                        id: row.id,
                        status: row.status == 1 ? 2 : 1
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
                        this.listLoading = false; //列表加载状态
                    })
                    .catch(error => {
                        console.log(error);
                        this.listLoading = false; //列表加载状态
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


