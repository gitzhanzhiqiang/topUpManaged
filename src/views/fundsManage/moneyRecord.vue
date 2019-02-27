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
            <el-form-item label="用户ID" prop="userId">
                <el-input v-model="params.userId" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="账号名称" prop="userName">
                <el-input v-model="params.userName" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="交易类型" prop="revenueExpendType">
                <el-select v-model="params.revenueExpendType" placeholder="请选择">
                    <el-option v-for="item in storage.tradeType" :key="item.value" :label="item.key" :value="item.value"></el-option>
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
            <el-table ref="multipleTable" :data="dataList" v-loading="listLoading" border fit highlight-current-row style="width: 100%">
                <el-table-column align="center" label="序号" width="70">
                    <template slot-scope="scope">
                        {{(params.pageIndex-1)*params.pageSize+parseInt(scope.$index) + 1}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="用户ID" width="">
                    <template slot-scope="scope">
                        {{scope.row.userId}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="账号名称" width="">
                    <template slot-scope="scope">
                        {{scope.row.userName}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="以太坊账号" width="350">
                    <template slot-scope="scope">
                        {{scope.row.walletAddress}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="流水编号">
                    <template slot-scope="scope">
                        {{scope.row.requestNo}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作平台币">
                    <template slot-scope="scope">
                        {{scope.row.amount}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="交易类型" width="">
                    <template scope="scope">
                    {{scope.row.revenueExpendType}}
                         <span v-for='itm in storage.tradeType' v-if='itm.value == scope.row.revenueExpendType'>{{itm.key}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="交易内容">
                    <template slot-scope="scope">
                        {{scope.row.remark}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作时间" width="150">
                    <template slot-scope="scope">
                        {{scope.row.createTime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="到账时间" width="150">
                    <template slot-scope="scope">
                        {{scope.row.modifiedTime}}
                    </template>
                </el-table-column>
                 <el-table-column align="center" label="平台币余额" width="">
                    <template slot-scope="scope">
                        {{scope.row.balance}}
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 分页 -->
        <div v-if="total" class="pagination-container">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentPageChange" :current-page.sync="params.pageIndex" :page-sizes="[10,20,30, 50]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

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
            storage: storage,
            listLoading: false, //表格加载
            params: { //搜索条件
                pageSize: 10,
                pageIndex: 1,
                userId: '',
                userName: '',
                revenueExpendType: '',
            },
            dataList: [], //表格list
            total: 0
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
            console.log(this.params)
            ajax({
                url: 'PlatformCurrency/getCapitalRecord',
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
            downloadExecl({ url: 'PlatformCurrency/exportCapitalRecord', input: this.params, method: 'get' })
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


