import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Card, 
  Table, 
  Statistic, 
  Row, 
  Col, 
  Typography, 
  Spin,
  message,
  Tag,
  Space,
  Tooltip
} from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileTextOutlined, 
  UserOutlined, 
  CalendarOutlined,
  CodeOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { ReviewReport, CommitInfo, FileChange } from '../types';
import { reviewApi } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ReviewReportModalProps {
  visible: boolean;
  reviewId: string;
  onClose: () => void;
}

const ReviewReportModal: React.FC<ReviewReportModalProps> = ({
  visible,
  reviewId,
  onClose
}) => {
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && reviewId) {
      fetchReport();
    }
  }, [visible, reviewId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reviewApi.getReport(reviewId);
      setReport(data);
    } catch (error) {
      message.error('获取评审报告失败');
    } finally {
      setLoading(false);
    }
  };

  const getFileStatusTag = (status: string) => {
    const statusConfig = {
      added: { color: 'success', text: '新增' },
      modified: { color: 'processing', text: '修改' },
      deleted: { color: 'error', text: '删除' },
      renamed: { color: 'warning', text: '重命名' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.modified;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const commitColumns = [
    {
      title: '提交哈希',
      dataIndex: 'hash',
      key: 'hash',
      width: 100,
      render: (hash: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {hash}
        </Text>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      render: (author: string) => (
        <Space>
          <UserOutlined />
          <span>{author}</span>
        </Space>
      ),
    },
    {
      title: '提交信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message: string) => (
        <Tooltip title={message}>
          <span>{message}</span>
        </Tooltip>
      ),
    },
    {
      title: '文件变更',
      dataIndex: 'files_changed',
      key: 'files_changed',
      width: 100,
      render: (count: number) => (
        <Space>
          <FileTextOutlined />
          <span>{count}</span>
        </Space>
      ),
    },
    {
      title: '代码变更',
      key: 'code_changes',
      width: 120,
      render: (_: any, record: CommitInfo) => (
        <Space>
          <Tag color="green" icon={<PlusOutlined />}>
            +{record.lines_added}
          </Tag>
          <Tag color="red" icon={<MinusOutlined />}>
            -{record.lines_deleted}
          </Tag>
        </Space>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <span>{dayjs(date).format('MM-DD HH:mm')}</span>
        </Space>
      ),
    },
  ];

  const fileColumns = [
    {
      title: '文件路径',
      dataIndex: 'file_path',
      key: 'file_path',
      ellipsis: true,
      render: (path: string) => (
        <Tooltip title={path}>
          <Text code style={{ fontSize: '12px' }}>
            {path}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getFileStatusTag(status),
    },
    {
      title: '代码变更',
      key: 'code_changes',
      width: 120,
      render: (_: any, record: FileChange) => (
        <Space>
          <Tag color="green" icon={<PlusOutlined />}>
            +{record.lines_added}
          </Tag>
          <Tag color="red" icon={<MinusOutlined />}>
            -{record.lines_deleted}
          </Tag>
        </Space>
      ),
    },
  ];

  // 准备图表数据
  const commitChartData = report?.report_data.commits.map(commit => ({
    name: commit.hash,
    commits: 1,
    additions: commit.lines_added,
    deletions: commit.lines_deleted,
  })) || [];

  const contributorData = report?.report_data.summary.contributors.map(contributor => ({
    name: contributor,
    value: report.report_data.commits.filter(c => c.author === contributor).length,
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Modal
      title="代码评审报告"
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
    >
      <Spin spinning={loading}>
        {report && (
          <div>
            {/* 统计概览 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="总提交数"
                    value={report.total_commits}
                    prefix={<CodeOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="文件变更数"
                    value={report.total_files_changed}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="新增代码行"
                    value={report.total_lines_added}
                    prefix={<PlusOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="删除代码行"
                    value={report.total_lines_deleted}
                    prefix={<MinusOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 贡献者分布 */}
            <Card title="贡献者分布" style={{ marginBottom: '24px' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={contributorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contributorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
                <Col xs={24} lg={12}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={commitChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="additions" fill="#3f8600" name="新增行数" />
                      <Bar dataKey="deletions" fill="#cf1322" name="删除行数" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card>

            {/* 提交记录 */}
            <Card title="提交记录" style={{ marginBottom: '24px' }}>
              <Table
                columns={commitColumns}
                dataSource={report.report_data.commits}
                rowKey="hash"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                size="small"
              />
            </Card>

            {/* 文件变更 */}
            <Card title="文件变更详情">
              <Table
                columns={fileColumns}
                dataSource={report.report_data.file_changes}
                rowKey="file_path"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                size="small"
              />
            </Card>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ReviewReportModal;
