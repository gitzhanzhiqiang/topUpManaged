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
            <el-form-item label="标题" prop="title">
                <el-input v-model="params.title" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="更新时间" prop="date">
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
            </el-button-group>
             <el-button-group>
                <el-button type="primary" size="medium" @click="editData()">添加文章</el-button>
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
                <el-table-column align="center" label="文章标题">
                    <template slot-scope="scope">
                        {{scope.row.title}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="发布系统">
                    <template slot-scope="scope">
                        {{scope.row.systemCode}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="发布日期">
                    <template slot-scope="scope">
                        {{scope.row.pubTime  | parseTime('{y}-{m}-{d} {h}:{i}:{s}')}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="创建时间">
                    <template slot-scope="scope">
                        {{scope.row.createTime  | parseTime('{y}-{m}-{d} {h}:{i}:{s}')}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="更新时间">
                    <template slot-scope="scope">
                        {{scope.row.modifiedTime  | parseTime('{y}-{m}-{d} {h}:{i}:{s}')}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="editData(scope.row)">编辑</el-button>
                          <el-button type="primary" size="mini" @click="deleteData(scope.row,-1)">删除</el-button>
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
        <el-dialog :title="title" :visible.sync="dialogVisible" class="autoAlert">
            <el-form :rules="rules" :model="alertFrom" ref="alertFrom" label-width="100" @keyup.enter.native="submitFrom('alertFrom')">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="文章标题" prop="title">
                            <el-input v-model="alertFrom.title"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="发布系统" prop="systemCode">
                            <el-select v-model="alertFrom.systemCode" placeholder="请选择">
                                <el-option v-for="itm in system" :label="itm.name" :value="itm.code"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="发布语言" prop="languageType">
                            <el-select v-model="alertFrom.languageType" placeholder="请选择">
                                <el-option label="中文" value="1"></el-option>
                                <el-option label="英文" value="2"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="发布时间" prop="pubTime">
                           <el-date-picker v-model="alertFrom.pubTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="文章简介" prop="summary">
                    <el-input type="textarea" :rows="3" placeholder="请输入" v-model="alertFrom.summary"></el-input>
                </el-form-item>
                <el-form-item label="封面图" prop="thumbnail">
                    <img :src="alertFrom.thumbnail" style='width:148px;height:148px;float: left;margin-right: 20px;' v-show='imgis'>
                    <!--<el-input v-show="false" v-model="rowData.coverImage" placeholder="请输入"></el-input>-->
                    <upLoadimg :isOne="true" :dialogVisible="dialogVisible" :imgShow="alertFrom.thumbnail" v-on:successLoad="(value)=> successLoad(value, 'alertFrom', 'thumbnail')" v-on:handleRemove="(value)=> handleRemove(value, 'alertFrom', 'thumbnail')"></upLoadimg>
                </el-form-item>
                <el-form-item label="文章内容" prop="content" class="weditor_width">
                    <!--<el-input v-model="rowData.content" placeholder="请输入"></el-input>-->
                    <weditor v-bind:editorName="'subjectEditorName'" :isAlert="true" v-on:listenWEditorChange="(value) =>wEditorChange(value, 'alertFrom', 'content')" v-model="alertFrom.content" style="width:60%;" ref="post_body"></weditor>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitFrom('alertFrom')" :loading="loading">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import ajax from '@utils/config';
import { parseTime } from '@src/filters';
import { storage } from '@constants/dataStorage';
import upLoadimg from '@src/components/upLoadimg1';
import { Common } from '@src/common/common';
import weditor from '@src/components/WEditor/WEditor';
export default {
    components: {
        upLoadimg,
        weditor
    },
    data() {
        return {
            storage: storage,
            listLoading: false, //表格加载
            loading: false,
            imgis:false,
            params: { //搜索条件
                pageSize: 10,
                pageIndex: 1,
                title: '',
                date: [],
                beginTime: '',
                endTime: ''

            },
            dataList: [true], //表格list
            system:[],//系统
            total: 0,
            title: '',
            dialogVisible: false, // 查看
            alertFrom: {
                id:'',
                title:'',//文章标题
                systemCode:'',//系统编码
                languageType:'',//文章类型
                pubTime:'',//时间
                summary:'',//文章简介
                thumbnail:'',//封面图
                content:'',//活动简介
                status:'',
                // https://img.zhaogu168.com/jmlc/infoimg/202809/201810091756325528.png
            },
            rules: {
                title: [
                    { required: true, message: '请输入', trigger: 'blur' },
                ],
                systemCode: [
                    { required: true, message: '请选择', trigger: 'blur' }
                ],
                languageType: [
                    { required: true, message: '请选择', trigger: 'blur' },
                ],
                 pubTime: [
                    { required: true, message: '请选择', trigger: 'blur' },
                ],
                 summary: [
                    { required: true, message: '请选择', trigger: 'blur' },
                ],
                 content: [
                    { required: true, message: '请选择', trigger: 'blur' },
                ],
            }
        }
    },
    computed: {
    },
    created() {
        this.getTable();
        this.getTablea()
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
            this.params.beginTime =date[0];
            this.params.endTime = date[1];
            console.log(this.params)
            ajax({
                url: 'tNews/list',
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
         getTablea(isSeach) {     
            ajax({
                url: 'tAppSystem/list',
                optionParams:{}
            }).post()
                .then(response => {
                    if (response.code === 200) {
                        this.system = response.data ? response.data : [];
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
        editData(row) {
            console.log(row)
            
            this.dialogVisible = true;
            this.loading = false;
            if (row) {
                this.title = '编辑文章';
                this.imgis = true
                this.alertFrom.thumbnail = ''
            } else {
                this.title = '添加文章';
                 this.imgis = false
                this.alertFrom = {};
                return false
            }
            this.$nextTick(() => {
                this.$refs['alertFrom'].clearValidate();
            })
            console.log(this.alertFrom.id)
            ajax({
                url: 'tNews/newsDetail/'+ row.id,
                optionParams:{}
            }).fetch()
                .then(response => {
                    if (response.code === 200) {
                        this.alertFrom = response.data ? response.data : {};
                         this.alertFrom.id=row.id
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
        //删除
        deleteData(row,num) {
            this.$confirm('是否删除修改', '确认？', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {

                let status = ''
            	if(num == -1){
            		status = num
            	}else{
            		if(row.status == 1){
            			status = 2
            		}else if (row.status == 2){
            			status = 1
            		}
            	}
					ajax({
		                url: 'tNews/changStatus',
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
        //复文本
        wEditorChange(html, firstName, twoName) {
            this[firstName][twoName] = html;
            console.log(html)
        },
        submitFrom(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.loading = true;
                     //this.alertFrom.pubTime = parseTime(this.alertFrom.pubTime, '{y}-{m}-{d} {h}:{i}:{s}');
                    console.log(this.alertFrom)
                     let url = '';
                        if (this.title === '编辑文章') {
                            url = 'tNews/update';
                        } else {
                            url = 'tNews/add';
                        }

                    ajax({
                        url: url,
                        optionParams:this.alertFrom
                    }).post()
                        .then(response => {
                            if (response.code === 200) {
                               this.getTable();
                                this.dialogVisible = false;
                                 this.$message({
                                    message: response.msg,
                                    type: 'warning'
                                });
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



                } else {
                    console.log('error submit!!');
                    return false;
                }
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


