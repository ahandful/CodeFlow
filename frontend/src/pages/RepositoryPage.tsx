import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm, 
  Space,
  Typography,
  Tag
} from 'antd';
import { PlusOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Repository } from '../types';
import { repositoryApi } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const RepositoryPage: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const data = await repositoryApi.getAll();
      setRepositories(data);
    } catch (error) {
      message.error('获取仓库列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: any) => {
    try {
      await repositoryApi.add(values);
      message.success('仓库添加成功');
      setModalVisible(false);
      form.resetFields();
      fetchRepositories();
    } catch (error: any) {
      message.error(error.message || '添加仓库失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await repositoryApi.delete(id);
      message.success('仓库删除成功');
      fetchRepositories();
    } catch (error: any) {
      message.error(error.message || '删除仓库失败');
    }
  };

  const columns = [
    {
      title: '仓库名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Repository) => (
        <Space>
          <LinkOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '仓库URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Repository) => (
        <Space>
          <Popconfirm
            title="确定要删除这个仓库吗？"
            description="删除后相关的评审记录也会被删除"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          仓库管理
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          添加仓库
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={repositories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个仓库`,
          }}
        />
      </Card>

      <Modal
        title="添加仓库"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="name"
            label="仓库名称"
            rules={[{ required: true, message: '请输入仓库名称' }]}
          >
            <Input placeholder="例如：my-awesome-project" />
          </Form.Item>

          <Form.Item
            name="url"
            label="Git仓库URL"
            rules={[
              { required: true, message: '请输入Git仓库URL' },
              { 
                pattern: /^(https?:\/\/|git@)[\w\.-]+[\w\.-]+\/[\w\.-]+\.git$/, 
                message: '请输入有效的Git仓库URL' 
              }
            ]}
          >
            <Input placeholder="https://github.com/username/repository.git" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea 
              placeholder="仓库描述（可选）"
              rows={3}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RepositoryPage;
