<template>
    <div class="app-container calendar-list-container ggg_user">
        <!-- 搜索条件 -->
        <el-form :inline="true" :model="params" ref="params" class="demo-form-inline" @keyup.enter.native="getTable('isseach')">
            <!--<el-form-item label="当前页:" prop="page" v-show="false">
                <el-input v-model="params.page"></el-input>
            </el-form-item>
            <el-form-item label="行数:" prop="limit" v-show="false">
                <el-input v-model="params.limit"></el-input>
            </el-form-item>-->
             <el-form-item label="系统名称" prop="name">
            <el-input v-model="params.name" placeholder="请输入"></el-input>
            </el-form-item>
            <!--<el-form-item label="更新时间" prop="date">
                <el-date-picker v-model="params.date" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>-->
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
                <el-button type="primary" size="medium" @click="editData()">添加系统</el-button>
            </el-button-group>
        </div>
        <!-- 列表 -->
        <div class="filter-container">
            <el-table ref="multipleTable" :data="dataList" v-loading="listLoading" border fit highlight-current-row style="width: 100%">
                <!--<el-table-column align="center" label="序号" width="70">
                    <template slot-scope="scope">
                        {{(params.limit-1)*params.page+parseInt(scope.$index) + 1}}
                    </template>
                </el-table-column>-->
                <el-table-column align="center" label="系统名称">
                    <template slot-scope="scope">
                        {{scope.row.name}}
                        <!--<span v-for="item in type" :key="item.value" v-text="item.key" v-show="item.value == 2"></span>-->
                    </template>
                </el-table-column>
                <el-table-column align="center" label="系统编码">
                    <template slot-scope="scope">
                        {{scope.row.code}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="创建时间">
                    <template slot-scope="scope">
                        {{scope.row.createTime  | parseTime('{y}-{m}-{d} {h}:{i}:{s}')}}
                    </template>
                </el-table-column>         
                <el-table-column align="center" label="更新时间" width="">
                    <template slot-scope="scope">
                        {{scope.row.modifiedTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}')}}
                    </template>
                </el-table-column>
                 <el-table-column align="center" label="状态">
                    <template slot-scope="scope">
                       <span v-for="itm in status" v-if = 'itm.value == scope.row.status'>{{itm.key}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" width="">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="editData(scope.row,true)">编辑</el-button>
                        <el-button type="primary" size="mini" @click="deleteData(scope.row,-1)">删除</el-button>
                        <el-button type="primary" size="mini" @click="deleteData(scope.row)" v-if='scope.row.status == 1' style='background: red;border:1px solid red;'>禁用</el-button>
                         <el-button type="primary" size="mini" @click="deleteData(scope.row)" v-if='scope.row.status == 2'>启用</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 分页 -->
        <!--<div v-if="total" class="pagination-container">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentPageChange" :current-page.sync="params.page" :page-sizes="[10,20,30, 50]" :page-size="params.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>-->
        <el-dialog :title="title" :visible.sync="dialogVisible" width="47%" class="autoAlert">
            <el-form :rules="rules" :model="alertFrom" ref="alertFrom" label-width="155" @keyup.enter.native="submitFrom('alertFrom')">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="系统名称" prop="name">
                            <el-input v-model="alertFrom.name"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="系统编码" prop="code">
                            <el-input v-model="alertFrom.code"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-row :gutter="20">
                    
                    <el-col :span="12">
                        <el-form-item label="是否启用" prop="status">
                            <el-select v-model="alertFrom.status" placeholder="请选择">
                                <el-option v-for="item in status" :key="item.value" :label="item.key" :value="item.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="系统描述" prop="remark">
                    <el-input type="textarea" :rows="3" placeholder="请输入" v-model="alertFrom.remark"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer" v-if="title != '查看消息模板'">
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
import { Common } from '@src/common/common';
import { validate } from '@src/utils/validation';
export default {
    components: {
    },
    data() {
        var phone = (rule, value, callback) => {
            if (!validate.validatPhone(value)) {
                callback(new Error('手机号号码格式不正确'));
                return false;
            }
            callback();
        };
        var email = (rule, value, callback) => {
            if (!validate.validaEmail(value)) {
                callback(new Error('邮箱格式不正确'));
                return false;
            }
            callback();
        };
        return {
            storage: storage,
            listLoading: false, //表格加载
            loading: false,
            params: { //搜索条件
//              limit: 10,
//              page: 1,
//              type: '',
//              status: '',
//              date: [],
//              beginTime: '',
//              endTime: '',
//              orderByField: 'modifiedTime',
//              isAsc: false,
                name:'',
            },
            type: [
                { key: '短信', value: 1 },
                { key: '站内信', value: 2 }
            ],
            status: [
                { key: '启用', value: 1 },
                { key: '关闭', value: 2 }
            ],
            dataList: [true, 1, 2], //表格list
            total: 0,
            title: '',
            dialogVisible: false, // 查看
            alertFrom: {
                remark: '',
                name: '',
                code: '',
                status: '',
                id:'',
            },
            rules: {
                name: [
                    { required: true, message: '请输入', trigger: 'blur' },
                ],
                code: [
                    { required: true, message: '请输入', trigger: 'blur' }
                ],
                remark: [
                    { required: true, message: '请输入', trigger: 'change' }
                ],
                status: [
                    { required: true, message: '请输入', trigger: 'change' }
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
//          if (isSeach) {
//              this.params.page = 1;
//          }
//          let date = this.params.date ? this.params.date : []; //时间控件清除为null
//          this.params.beginTime = parseTime(date[0], '{y}-{m}-{d} {h}:{i}:{s}');
//          this.params.endTime = parseTime(date[1], '{y}-{m}-{d} {h}:{i}:{s}');
            console.log(this.params)
            ajax({
                url: 'tAppSystem/list',
                optionParams: this.params
            }).post()
                .then(response => {
                    if (response.code === 200) {
                        this.dataList = response.data ? response.data : [];
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
        editData(row, number) {
            this.dialogVisible = true;
            this.loading = false;
            if (number) {
                this.title = '编辑系统';
                this.alertFrom.id=row.id
                this.alertFrom = JSON.parse(JSON.stringify(row));
            } else {
                this.title = '添加系统';
                this.alertFrom.id=''
                this.alertFrom = {
                	remark: '',
	                name: '',
	                code: '',
	                status: '',
	                id:'',
                }
            }



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
		                url: 'tAppSystem/changStatus',
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
        //格式化整数
        formatIntegery(e, firstName, twoNameName) {
            let obj = {
                input: e
            }
            this[firstName][twoNameName] = Common.positiveIntegerMoney(obj); //表单赋值
        },
        submitFrom(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.loading = true;
					 let url = '';
                    if (this.title === '编辑系统') {
                        url = 'tAppSystem/update';
                    } else {
                        url = 'tAppSystem/add';
                    }
                    console.log(this.alertFrom)
                    ajax({
                        url: url,
                        optionParams: this.alertFrom
                    }).post()
                        .then(response => {
                            if (response.code === 200) {
                                // this.alertFrom = response.data ? response.data : {};
                                this.$message.success(response.msg);
                                this.dialogVisible = false;
                                this.getTable();
                                this.loading = false;
                            } else {
                                this.$message.warning(response.msg);

                                this.loading = false;
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
//      // 改变每一页的条数
//      handleSizeChange(val) {
//          this.params.limit = val;
//          this.params.page = 1; //从第一页开始
//          this.getTable();
//      },
//      // 切换页码
//      handleCurrentPageChange(val) {
//          this.params.page = val;
//          this.getTable();
//      },
        //重置表单
        resetForm(formName) {
            this.$refs[formName].resetFields();
        }

    },
    filters: {
//      // 1短信 2系统推送
//      messageTemplateTypefilters(val) {
//          let value = parseInt(val)
//          if (value == 1) {
//              return "短信"
//          } else if (value == 2) {
//              return "站内信"
//          }
//      },
//      // 状态:1启用 2关闭
//      messageTemplateStatusfilters(val) {
//          let value = parseInt(val)
//          if (value == 1) {
//              return "启用"
//          } else if (value == 2) {
//              return "关闭"
//          }
//      }

    }
}
</script>
<style lang="less" scoped>

</style>
