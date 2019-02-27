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
            <el-form-item label="角色名称" prop="name">
                <el-input v-model="params.name" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="params.status" placeholder="请选择">
                    <el-option v-for="item in status" :key="item.value" :label="item.key" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="添加时间" prop="date">
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
                <el-button type="primary" size="medium" @click="editData()">添加角色</el-button>
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
                <el-table-column align="center" label="角色名称">
                    <template slot-scope="scope">
                        {{scope.row.name}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="角色描述">
                    <template slot-scope="scope">
                        {{scope.row.remark}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="状态">
                    <template slot-scope="scope">
                        <span v-for="item in status" :key="item.value" v-text="item.key" v-show="item.value == scope.row.status"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="添加时间">
                    <template slot-scope="scope">
                        {{scope.row.timeCreate}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" width="400">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="editData(scope.row)">编辑</el-button> 
                        <el-button type="primary" size="mini" @click="permissions(scope.row)">权限</el-button>
                        <el-button type="primary" size="mini" @click="look_over(scope.row)">用户组员</el-button>
                        <el-button type="primary" size="mini" @click="editDatac(scope.row)">删除</el-button> 
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 分页 -->
        <div v-if="total" class="pagination-container">
            <el-pagination background @size-change="(value)=> handleSizeChange(value, 'params', 'getTable')" @current-change="(value)=> handleCurrentPageChange(value, 'params', 'getTable')" :current-page.sync="params.pageIndex" :page-sizes="[10,20,30, 50]" :page-size="params.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
        <el-dialog :title="title" :visible.sync="dialogVisible" width="30%" class="autoAlert">
            <el-form :rules="rules" :model="alertFrom" ref="alertFrom" label-width="100" @keyup.enter.native="submitFrom('alertFrom')">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="alertFrom.name"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="alertFrom.status" placeholder="请选择">
                        <el-option v-for="item in status" :key="item.value" :label="item.key" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="角色描述" prop="remark">
                    <el-input type="textarea" :rows="8" placeholder="请输入" v-model="alertFrom.remark"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitFrom('alertFrom',title)" :loading="loading">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="权限配置" :visible.sync="dialogVisible1" width="30%" class="autoAlert">
            <el-tree ref="tree" :data="listInfo" show-checkbox node-key="id" :props="defaultProps" default-expand-all>
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible1 = false">取 消</el-button>
                <el-button type="primary" @click="SubmitPermissions('alertFrom1')" :loading="loading">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="查看用户" :visible.sync="dialogVisible2">
            <el-table ref="multipleTable" :data="dataList1" v-loading="listLoading1" border fit highlight-current-row style="width: 100%">
                <el-table-column align="center" label="序号" width="70">
                    <template slot-scope="scope">
                        {{(params.pageIndex-1)*params.pageSize+parseInt(scope.$index) + 1}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="登录名">
                    <template slot-scope="scope">
                        {{scope.row.loginCode}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="姓名">
                    <template slot-scope="scope">
                        {{scope.row.name}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="手机号">
                    <template slot-scope="scope">
                        {{scope.row.phone}}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="所属部门">
                    <template slot-scope="scope">
                        {{scope.row.departmentName}}
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <!-- <div v-if="total1" class="pagination-container">
                <el-pagination background @size-change="(value) => handleSizeChange(value, 'params1', 'getAlertTable')" @current-change="(value) =>handleCurrentPageChange(value, 'params1', 'getAlertTable')" :current-page.sync="params1.pageIndex" :page-sizes="[10,20,30, 50]" :page-size="params1.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total1">
                </el-pagination>
            </div>-->
        </el-dialog>
    </div>
</template>
<script>
import ajax from '@utils/config';
import { parseTime } from '@src/filters';
import { storage } from '@constants/dataStorage';
export default {
    components: {
    },
    data() {
        return {
            storage: storage,
            listLoading: false, //表格加载
            loading: false,
            params: { //搜索条件
                pageSize: 10,
                pageIndex: 1,
                date: [],
                name:'',
                beginTime:'',
                endTime:'',
                status:'',
            },
            dataList: [true, 1, 2], //表格list
            total: 0,
            status: [
                { key: '已删除', value: '-1' },
                { key: '停用', value: '0' },
                { key: '正常', value: '1' }
            ],
            title: '',
            dialogVisible: false, // 查看
            alertFrom: {
                id:'',
                name:'',
                status:'',
                remark:'',
            },
            rules: {
                name: [
                    { required: true, message: '请输入', trigger: 'blur' },
                ],
                remark: [
                    { required: true, message: '请输入', trigger: 'blur' },
                ],
                status: [
                    { required: true, message: '请输入', trigger: 'change' },
                ],
            },
            dialogVisible1: false, //权限
            listInfo:[], //树形
            defaultProps: {
                children: 'children',
                label: 'label'
            },
            dialogVisible2: false, //查看
            dataList1: [], //表格list
            total1: 0,
            listLoading1: false, //表格加载
            params1: { //搜索条件
               pageSize: 10,
                pageIndex: 1,
                roleId:'',
            },
           roleId: '', //角色id保存
        }
    },
    computed: {
    },
    created() {
        this.getTable();
        this.getMenuList();
    },
    mounted() {

    },
    methods: {
          //删除角色
        editDatac(row) {

                 this.$confirm('是否删除修改', '确认？', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                
					 ajax({
                        url: '/sysRole/delete/'+row.id,
                    }).post()
                        .then(res => {
                            console.log(res)
                            if(res.code == 200){
                                 this.getTable();
                                  this.$message({
                                    message: res.msg,
                                    type: 'warning'
                                });
                            }
                        })
                        .catch(error => {
                            console.log(error)
                        })
            }).catch(() => {
            });  
        },
        //获取菜单
        getMenuList() {
            ajax({
                url: 'sysMenu/listMenu',
            }).post()
                .then(res => {
                    this.listInfo = res.data ? res.data : [];
                })
                .catch(error => {
                    console.log(error)
                })
        },
        //获取列表
        getTable(isSeach) {
            this.listLoading = true; //列表加载状态
            if (isSeach) {
                this.params.pageIndex = 1;
            }
            let date = this.params.date ? this.params.date : []; //时间控件清除为null
            this.params.beginTime = parseTime(date[0], '{y}-{m}-{d} {h}:{i}:{s}');
            this.params.endTime = parseTime(date[1], '{y}-{m}-{d} {h}:{i}:{s}');
            console.log(this.params);
            ajax({
                url: 'sysRole/listQuery',
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
        editData(row) {
            this.dialogVisible = true;
            this.loading = false;
            this.$nextTick(()=> {
                this.$refs['alertFrom'].clearValidate();
            });
            if (row) {
                this.alertFrom =  JSON.parse(JSON.stringify(row));
                this.title = '编辑角色';
                this.alertFrom = row;
            } else {
                this.title = '添加角色';
                this.alertFrom = {
                    id:'',
                    name:'',
                    status:'',
                    remark:'',
                };
            }
        },
        //提交
        submitFrom(formName,title) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    let method = '';
                    if (title == '编辑角色'){
                        method = 'sysRole/update'
                    }else{
                        method = 'sysRole/add'
                    }
                    ajax({
                        url: method,
                        optionParams: this.alertFrom
                    }).post()
                        .then(response => {
                            console.log(response)
                            if (response.code === 200) {
                                this.$message.success(response.msg);
                                this.dialogVisible = false;
                                this.getTable()
                            } else {
                                this.loading = false;
                                this.$message.warning(response.msg)
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
        //权限
        permissions(row) {
            this.dialogVisible1 = true;
            this.loading = false;
            this.roleId = row.id;
            this.getcheckedAuth(row.id)
        },
        //获取当前角色 勾选权限
        getcheckedAuth(id) {
            ajax({
                url: 'sysRole/getInfoById/'+id,
            }).post()
                .then(res => {
                    let tmproleData;
                    tmproleData = res.data.menuIds ? res.data.menuIds : [];
                    this.$refs.tree.setCheckedKeys(tmproleData);
                })
                .catch(error => {
                    console.log(error)
                })
        },
        //提交权限
        SubmitPermissions() {
            let tree = this.$refs.tree.getCheckedKeys();
            console.log(this.roleId)
            if (tree.length == 0) {
                this.$message({
                    message: '至少选择一项',
                    type: 'warning'
                });
                return false;
            }
            this.loading = true;
            ajax({
                url: 'sysRole/update',
                optionParams: {
                    menuIds: tree,
                    id: this.roleId,
                }
            }).post()
                .then(response => {
                    if (response.code === 200) {
                        this.$message.success(response.msg);
                        this.dialogVisible1 = false;
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
                });
        },
        //查看
        look_over(row) {
            this.dialogVisible2 = true;
            this.params1.page = 1;
            this.params1.roleId = row.id;
            this.getAlertTable();
        },
        //获取列表
        getAlertTable(isSeach) {
            this.listLoading1 = true; //列表加载状态
            if (isSeach) {
                this.params1.pageIndex = 1;
            }
            ajax({
                url: '/sysRole/getListById/'+this.params1.roleId,
                optionParams: {}
            }).post()
                .then(response => {
                    if (response.code === 200) {
                        this.dataList1 = response.data ? response.data : [];
                    } else {
                        this.$message({
                            message: response.msg,
                            type: 'warning'
                        });
                    }
                    this.listLoading1 = false; //列表加载状态
                })
                .catch(error => {
                    console.log(error);
                    this.listLoading1 = false; //列表加载状态
                })
        },
        // 改变每一页的条数
        handleSizeChange(val, name, fn) {
            this[name].pageSize = val;
            this[name].pageIndex = 1; //从第一页开始
            this[fn]();
        },
        // 切换页码
        handleCurrentPageChange(val, name, fn) {
            this[name].pageIndex = val;
            this[fn]();
        },
        //重置表单
        resetForm(formName) {
            this.$refs[formName].resetFields();
        }

    },
    filters: {
        delFlagFilters(val){
            let value = parseInt(val);
            if(value == 0){
                return '可用'
            }else if(value == 1){
                return '禁用';
            }else{
                return "异常"
            }
        }
    }
}
</script>
<style lang="less" scoped>

</style>
