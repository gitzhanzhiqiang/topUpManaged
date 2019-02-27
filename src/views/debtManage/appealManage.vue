<template>
    <div class="app-container calendar-list-container ggg_user">
        <!-- 搜索条件 -->
        <el-form :inline="true" :model="params" ref="params" class="demo-form-inline" @keyup.enter.native="getTable('isseach')">
            <el-form-item label="当前页:" prop="page" v-show="false">
                <el-input v-model="params.page"></el-input>
            </el-form-item>
            <el-form-item label="行数:" prop="limit" v-show="false">
                <el-input v-model="params.limit"></el-input>
            </el-form-item>
            <el-form-item label="应用编号" prop="id">
                <el-input v-model="params.id" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="应用名称" prop="userId">
                <el-input v-model="params.userId" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="params.status" placeholder="请选择">
                    <el-option v-for="item in status" :key="item.value" :label="item.key" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="上架时间" prop="date">
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
                <el-button type="primary" size="medium" icon="el-icon-refresh" @click="$refs.multipleTable.clearSelection();getTable();">刷新</el-button>
                <el-button type="primary" size="medium" @click="download">添加应用</el-button>
            </el-button-group>
        </div>
        <!-- 列表 -->
        <div class="filter-container">
            <el-table ref="multipleTable" :data="dataList" v-loading="listLoading" border fit highlight-current-row style="width: 100%">
                <el-table-column align="center" label="序号" width="70">
                    <template slot-scope="scope">
                        {{(params.page-1)*params.limit+parseInt(scope.$index) + 1}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="应用编号" width="180">
                    <template slot-scope="scope">
                        {{scope.row.id}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="应用名称" width="">
                    <template slot-scope="scope">
                        {{scope.row.name}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="排序" width="">
                    <template slot-scope="scope">
                        {{scope.row.sort}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="上架时间" width="">
                    <template slot-scope="scope">
                        {{scope.row.createTime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="更新时间" width="">
                    <template slot-scope="scope">
                        {{scope.row.modifiedTime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="下架时间" width="">
                    <template slot-scope="scope">
                        {{scope.row.expTime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="状态" width="140">
                    <template slot-scope="scope">
                        <span v-for="item in status" :key="item.value" v-text="item.key" v-show="item.value == scope.row.status"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" fixed="right" width="300">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="lookOver(scope.row)">查看</el-button>
                        <el-button type="primary" size="mini" @click="deleteData(scope.row,3)" style='background: red;border:1px solid red;'>删除</el-button>
                        <el-button type="primary" size="mini" @click="deleteData(scope.row)" v-if='scope.row.status == 1' style='background: red;border:1px solid red;'>禁用</el-button>
                         <el-button type="primary" size="mini" @click="deleteData(scope.row)" v-if='scope.row.status == 2'>启用</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 分页 -->
        <div v-if="total" class="pagination-container">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentPageChange" :current-page.sync="params.page" :page-sizes="[10,20,30, 50]" :page-size="params.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
        <el-dialog :title="title" :visible.sync="dialogVisible" width="47%">
             <el-form :rules="rules" :model="alertFrom" ref="alertFrom" label-width="100" @keyup.enter.native="submitFrom('alertFrom')">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="应用名称" prop="name">
                            <el-input v-model="alertFrom.name"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                         <el-form-item label="排序" prop="sort">
                            <el-input v-model="alertFrom.sort"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                         <el-form-item label="跳转路径" prop="hrefUrl">
                            <el-input v-model="alertFrom.hrefUrl"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                             <el-form-item label="是否推荐" prop="isTop">
                                <el-select v-model="alertFrom.isTop" placeholder="请选择">
                                    <el-option label="是" value="1"></el-option>
                                    <el-option label="否" value="2"></el-option>
                             </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="应用描述" prop="describe">
                    <el-input type="textarea" :rows="3" placeholder="请输入" v-model="alertFrom.describe"></el-input>
                </el-form-item>

                 <el-row :gutter="20">
                    <el-col :span="12">
                       <el-form-item label="推荐封面图" prop="logoUrl">
                            
                            <!--<el-input v-show="false" v-model="rowData.coverImage" placeholder="请输入"></el-input>-->
                            <upLoadimg :isOne="true" :dialogVisible="dialogVisible" :imgShow="alertFrom.logoUrl" v-on:successLoad="(value)=> successLoad(value, 'alertFrom', 'logoUrl')" v-on:handleRemove="(value)=> handleRemove(value, 'alertFrom', 'logoUrl')"></upLoadimg>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                       <el-form-item label="更多/热门封面图" prop="hotImg">
                            
                            <!--<el-input v-show="false" v-model="rowData.coverImage" placeholder="请输入"></el-input>-->
                            <upLoadimg :isOne="true" :dialogVisible="dialogVisible" :imgShow="alertFrom.hotImg" v-on:successLoad="(value)=> successLoad(value, 'alertFrom', 'hotImg')" v-on:handleRemove="(value)=> handleRemove(value, 'alertFrom', 'hotImg')"></upLoadimg>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm('alertFrom')" :loading="loading">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import ajax from '@utils/config';
import { parseTime } from '@src/filters';
import { storage } from '@constants/dataStorage';
import { downloadExecl } from '@src/common/downloadExecl';
import weditor from '@src/components/WEditor/WEditor';
import upLoadimg from '@src/components/upLoadimg1';
export default {
    components: {
        upLoadimg,
        weditor
    },
    data() {
        return {
            storage: storage,
            listLoading: false, //表格加载
            baseUrl: 'https://ygg168.oss-cn-shanghai.aliyuncs.com/',
            loading: false, //二次提交
            params: { //搜索条件
                limit: 10,
                page: 1,
                id: '',
                userId: '',
                phone: '',
                status: '',
                date: [],
                beginTime: '',
                endTime: '',
                orderByField: 'appealTime',
                isAsc: false

            },
            status: [
                { key: '启用', value: '1' },
                { key: '禁用', value: '2' },
                
            ],
            dataList: [true], //表格list
            total: 0,
            dialogVisible: false, // 查看
            edit: false, //是否编辑
            title: '',
            activeName: 'first',
             alertFrom: {
                id:'',
                name:'',//应用名称
                sort:'',//排序
                hrefUrl:'',//跳转路径
                isTop:'',//是否推荐
                describe:'',//应用描述
                logoUrl:'',//封面图
                hotImg:'',//热门封面图
            },
           
            rules: {
                name: [
                    { required: true, message: '请输入', trigger: 'blur' },
                ],
                sort: [
                    { required: true, message: '请输入', trigger: 'blur' },
                ],
                hrefUrl: [
                    { required: true, message: '请输入', trigger: 'blur' },
                ],
                isTop: [
                    { required: true, message: '请输入', trigger: 'change' },
                ],
                describe: [
                    { required: true, message: '请输入', trigger: 'blur' },
                ],
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
                this.params.page = 1;
            }
            let date = this.params.date ? this.params.date : []; //时间控件清除为null
            this.params.beginTime = parseTime(date[0], '{y}-{m}-{d} {h}:{i}:{s}');
            this.params.endTime = parseTime(date[1], '{y}-{m}-{d} {h}:{i}:{s}');
            ajax({
                url: 'application/applicationList',
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
            this.activeName = 'first';
            this.dialogVisible = true;
            this.alertFrom= {
                id:'',
                name:'',//应用名称
                sort:'',//排序
                hrefUrl:'',//跳转路径
                isTop:'',//是否推荐
                describe:'',//应用描述
                logoUrl:'',//封面图
                hotImg:'',//热门封面图
            }
        },
        lookOver(row, number) {
            this.activeName = 'first';
            this.dialogVisible = true;
            this.loading = false;
            this.alertFrom = {};
            this.alertFrom = JSON.parse(JSON.stringify(row));
            console.log(this.alertFrom)
            this.$nextTick(() => {
                this.$refs['alertFrom'].clearValidate();
            })
        },
        deleteData(row,num){
            console.log(row)
             this.$confirm('是否删除修改', '确认？', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                 console.log(row)
                 let status = ''
            	if(num == 3){
            		status = num
            	}else{
            		if(row.status == 1){
            			status = 2
            		}else if (row.status == 2){
            			status = 1
            		}
            	}
					ajax({
		                url: 'application/changeApplication',
		                optionParams: {
		                	id:row.id,
		                	status:status,
		                }
		            }).post()
		                .then(response => {
		                    if (response.code === 200) {
		                        this.$message.success(response.msg);                 
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
        //弹框提交
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    ajax({
                        url: 'application/addApplication',
                        optionParams:this.alertFrom
                    }).post()
                        .then(response => {
                            if (response.code === 200) {
                                this.$message({
                                    message: response.msg,
                                    type: 'success'
                                });
                                this.dialogVisible = false;
                                this.getTable();
                            } else {
                                this.$message({
                                    message: response.msg,
                                    type: 'warning'
                                });
                                this.loading = false;
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            this.loading = false;
                        })
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
         //上传成功
        successLoad(url, firstName, twoName) {
            console.log(url)
            this[firstName][twoName] = url;
        },
        //删除
        handleRemove(url, firstName, twoName) {
            if (url == this[firstName][twoName]) {
                this[firstName][twoName] = '';
            }
        },
        // 改变每一页的条数
        handleSizeChange(val) {
            this.params.limit = val;
            this.params.page = 1; //从第一页开始
            this.getTable();
        },
        // 切换页码
        handleCurrentPageChange(val) {
            this.params.page = val;
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


