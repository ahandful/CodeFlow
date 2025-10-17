import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  message, 
  Space,
  Typography,
  Tag,
  Progress,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  FileSearchOutlined, 
  EyeOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { Review, Repository } from '../types';
import { reviewApi, repositoryApi } from '../services/api';
import dayjs from 'dayjs';
import ReviewReportModal from '../components/ReviewReportModal';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsData, repositoriesData] = await Promise.all([
        reviewApi.getAll(),
        repositoryApi.getAll()
      ]);
      setReviews(reviewsData);
      setRepositories(repositoriesData);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      const { repository_id, dateRange } = values;
      const [startDate, endDate] = dateRange;
      
      await reviewApi.create({
        repository_id,
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD')
      });
      
      message.success('评审创建成功');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.message || '创建评审失败');
    }
  };

  const handleGenerateReport = async (reviewId: string) => {
    try {
      message.loading('正在生成评审报告...', 0);
      await reviewApi.generateReport(reviewId);
      message.destroy();
      message.success('评审报告生成成功');
      fetchData();
    } catch (error: any) {
      message.destroy();
      message.error(error.message || '生成评审报告失败');
    }
  };

  const handleViewReport = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setReportModalVisible(true);
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      pending: { color: 'default', text: '待处理' },
      processing: { color: 'processing', text: '处理中' },
      completed: { color: 'success', text: '已完成' },
      failed: { color: 'error', text: '失败' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: '仓库名称',
      dataIndex: 'repository_name',
      key: 'repository_name',
      render: (text: string, record: Review) => (
        <Space>
          <FileSearchOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '评审时间',
      key: 'date_range',
      render: (_: any, record: Review) => (
        <span>
          {dayjs(record.start_date).format('YYYY-MM-DD')} 至 {dayjs(record.end_date).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
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
      render: (_: any, record: Review) => (
        <Space>
          {record.status === 'completed' && (
            <Button 
              type="primary" 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewReport(record.id)}
            >
              查看报告
            </Button>
          )}
          
          {record.status === 'pending' && (
            <Button 
              type="primary" 
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleGenerateReport(record.id)}
            >
              生成报告
            </Button>
          )}
          
          {record.status === 'processing' && (
            <Tooltip title="正在处理中，请稍候">
              <Button 
                size="small"
                disabled
                icon={<ReloadOutlined />}
              >
                处理中
              </Button>
            </Tooltip>
          )}
          
          {record.status === 'failed' && (
            <Button 
              type="primary" 
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleGenerateReport(record.id)}
            >
              重新生成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          代码评审
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          disabled={repositories.length === 0}
        >
          创建评审
        </Button>
      </div>

      {repositories.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <FileSearchOutlined style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#999' }}>
              暂无仓库
            </Title>
            <p style={{ color: '#999' }}>
              请先在"仓库管理"页面添加Git仓库，然后才能创建代码评审
            </p>
          </div>
        </Card>
      )}

      {repositories.length > 0 && (
        <Card>
          <Table
            columns={columns}
            dataSource={reviews}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个评审`,
            }}
          />
        </Card>
      )}

      <Modal
        title="创建代码评审"
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
          onFinish={handleCreate}
        >
          <Form.Item
            name="repository_id"
            label="选择仓库"
            rules={[{ required: true, message: '请选择仓库' }]}
          >
            <Select placeholder="请选择要评审的仓库">
              {repositories.map(repo => (
                <Select.Option key={repo.id} value={repo.id}>
                  {repo.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="评审时间区间"
            rules={[{ required: true, message: '请选择时间区间' }]}
          >
            <RangePicker 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建评审
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <ReviewReportModal
        visible={reportModalVisible}
        reviewId={selectedReviewId}
        onClose={() => setReportModalVisible(false)}
      />
    </div>
  );
};

export default ReviewPage;
