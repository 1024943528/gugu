<template>
    <div>
        <Row class="margin-top-10">
            <Card>

                <h4 slot="title">
                    <Icon type="android-archive"></Icon>
                    文件收发
                </h4>
                <Row span="1">
                    <Button type="primary" @click="addBtn">
                        <Icon type="plus"></Icon>
                        文件发送
                    </Button>
                    <Modal v-model="addModal" width="600px" :closable="closeable" :mask-closable="maskCloseable">
                        <p slot="header" style="text-align:center">
                            <Icon type="plus"></Icon>
                            <span>文件发送</span>
                        </p>
                        <div>
                            <Form ref="formValidate" :model="addForm" :label-width="80">
                                <FormItem label="接收人" prop="eva_tea_content">
                                    <Input v-model="addForm.eva_tea_content" placeholder="接收人"></Input>
                                </FormItem>

                                <FormItem label="发送人" prop="eva_stu_id">
                                    <Input v-model="addForm.eva_stu_id" readonly></Input>
                                </FormItem>

                                <FormItem label="文件" prop="eva_tea_upload">

                                    <Upload action="http://localhost:3000/api/base/upload" :on-success="handleAvatarSuccess" :file-list="fileList">

                                        <Button type="ghost" icon="ios-cloud-upload-outline">上传文件</Button>
                                    </Upload>
                                </FormItem>
                            </Form>
                        </div>
                        <div slot="footer">
                            <Button type="primary" @click="addTeacher('formValidate')">发送</Button>
                            <Button @click="cancelInput">取消</Button>
                        </div>
                    </Modal>
                    <Modal v-model="updateModal" width="600px" :closable="closeable1" :mask-closable="maskCloseable1">
                        <p slot="header" style="text-align:center">
                            <Icon type="edit"></Icon>
                            <span>文件列表</span>
                        </p>
                        <div v-for="file in excelFileName" :v-bind="file.id">
                            <Form ref="formValidate1" :model="updateForm" :label-width="80">
                                <FormItem label="序号" prop="id">
                                    <span>{{file.id}}</span>
                                </FormItem>
                                 <FormItem label="文件名" prop="id">
                                    <a :href="'http://localhost:3000/'+file.fileName">{{file.originalname}}</a>
                                </FormItem>

                            </Form>
                        </div>
                        <div slot="footer">
                            
                            <Button @click="cancelInput">取消</Button>
                        </div>
                    </Modal>
                </Row>
                <Row class="margin-top-10">
                    <Col span="23" class="margin-top-10">
                    <Table :size="size" border="border" :columns="excelColumns" :data="table2excelData" size="small" ref="tableExcel"></Table>
                    <Page class="margin-top-20" :total="total" :current="currentPage" :page-size="pageSize" @on-change="onchangePage"></Page>
                    </Col>

                </Row>
            </Card>
        </Row>
    </div>
</template>

<script>
import Cookies from "js-cookie";
import { login, getInfo } from "@/api/login";
import { pageList, work, base } from "@/sqlMap.js";
const userId = Cookies.get("Admin-Token");
console.log(userId);
export default {
  name: "teacher_manage",
  data() {
    return {
      fileList: [],
      eva_stu_id: "userId",
      excelColumns: [
        {
          title: "序号",
          key: "id",
          width: 50
        },
        {
          title: "发送人",
          key: "eva_stu_id",
          width: 120
        },
        {
          title: "资源ID",
          key: "eva_tea_id",
          width: 120,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.updateModal = true;
                      var excelFileName = JSON.parse(params.row.eva_tea_id);
                      if (excelFileName.length != 0) {
                        var sql = base.getCourseList(excelFileName);
                        this.$http.post("action", { sql: sql }).then(res => {
                          this.excelFileName=res.data
                        });
                      }
                    }
                  }
                },
                params.row.eva_tea_id
              )
            ]);
          }
        },
        {
          title: "接收人",
          key: "eva_tea_content",
          width: 400
        },
        // {
        //   title: "教师评语",
        //   key: "eva_work_content",
        //   width: 100
        // },
        {
          title: "操作",
          key: "action",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      var sql = work.delete.replace("?", params.row.id);
                      this.$http.post("action", { sql: sql }).then(res => {
                        this.request();
                      });
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      table2excelData: [],

      border: true,
      size: "large",
      excelFileName: "",
      tableExcel: {},
      fontSize: 16,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      addModal: false,
      updateModal: false,
      closeable: false,
      closeable1: false,
      maskCloseable: false,
      maskCloseable1: false,
      form: {
        //request
        pageSize: 20,
        currentPage: 1,
        or: {
          eva_stu_id: "",
          eva_tea_content: ""
        },
        table: "work"
      },
      addForm: {},
      updateForm: {},
      user: {}
    };
  },
  created() {
    getInfo().then(res => {
      this.user = res;
      this.addForm.eva_stu_id = res.username;
      this.form.or.eva_stu_id = res.username;
      this.form.or.eva_tea_content = res.username;
      this.request();
    });
  },
  mounted() {},
  methods: {
    request() {
      var sql = pageList.page(this.form);

      this.$http.post("action", { sql: sql }).then(res => {
        sql = pageList.count(this.form);
        this.$http.post("action", { sql: sql }).then(res => {
          this.total = res.data[0].total;
        });
        this.table2excelData = res.data;
      });
    },

    onchangePage(val) {
      this.currentPage = val;
      this.form.currentPage = val;
      this.request();
    },
    //add a teacher information
    addBtn() {
      this.addModal = true;
    },
    addTeacher(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // this.updateForm.tea_gender=parseInt(this.updateForm.tea_gender);
          this.addForm.eva_tea_id = JSON.stringify(this.fileList);
          this.$http.post("insert", { table: "work", data: this.addForm }).then(
            res => {
              this.cancelInput();
              this.request();
            },
            err => {
              this.$message.error("请求错误！");
            }
          );
        }
      });
    },
    cancelInput() {
      this.addModal = false;
      this.updateModal = false;
      this.updateForm = {};
      this.addForm = {
        eva_tea_id: "",
        eva_tea_content: ""
      };
    },
    handleSuccess(evnet, file) {
      this.$Notice.success({
        title: "文件上传成功",
        desc: "文件 " + file.name + " 上传成功。"
      });
    },

    //update teacher's information
    updateTeacher(name) {
      debugger;
      this.$refs[name].validate(valid => {
        if (valid) {
          // this.updateForm.tea_gender=parseInt(this.addForm.tea_gender);
          this.$http.post("action", this.updateForm).then(
            res => {
              if (res.data.success) {
                this.$Message.success(res.data.info);
                this.cancelInput();
              } else {
                this.$Message.error(res.data.info);
              }
            },
            err => {
              this.$message.error("请求错误！");
            }
          );
        } else {
        }
      });
    },
    //delete a teacher
    deleteTeacher(index) {},
    handleAvatarSuccess(res, file) {
      this.fileList = this.fileList.concat(res);
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../styles/common.less";
@import "./table.less";
</style>
