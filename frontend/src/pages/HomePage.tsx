import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import { 
  DatabaseOutlined, 
  FileSearchOutlined, 
  TeamOutlined,
  CodeOutlined 
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: '#1890ff', marginBottom: '16px' }}>
          CodeFlow
        </Title>
        <Title level={3} style={{ color: '#666', fontWeight: 'normal' }}>
          代码仓库管理和评审系统
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#999', maxWidth: '600px', margin: '0 auto' }}>
          一个现代化的代码仓库管理平台，支持Git仓库管理、代码评审、提交分析等功能，
          帮助团队更好地管理和分析代码变更。
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div className="stats-card">
              <DatabaseOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <div className="stats-number">仓库管理</div>
              <div className="stats-label">添加、删除、查看Git仓库</div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div className="stats-card">
              <FileSearchOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <div className="stats-number">代码评审</div>
              <div className="stats-label">选择时间区间进行代码评审</div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div className="stats-card">
              <CodeOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
              <div className="stats-number">提交分析</div>
              <div className="stats-label">分析提交记录和文件变更</div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div className="stats-card">
              <TeamOutlined style={{ fontSize: '48px', color: '#eb2f96', marginBottom: '16px' }} />
              <div className="stats-number">团队协作</div>
              <div className="stats-label">支持多贡献者分析</div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '48px', textAlign: 'center' }}>
        <Title level={3}>快速开始</Title>
        <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <Card>
            <Title level={4}>1. 添加仓库</Title>
            <Paragraph>
              在"仓库管理"页面添加您的Git仓库，支持HTTPS和SSH协议。
            </Paragraph>
          </Card>
          
          <Card>
            <Title level={4}>2. 创建评审</Title>
            <Paragraph>
              在"代码评审"页面选择仓库和时间区间，创建代码评审任务。
            </Paragraph>
          </Card>
          
          <Card>
            <Title level={4}>3. 查看报告</Title>
            <Paragraph>
              系统将自动分析代码变更，生成详细的评审报告和统计图表。
            </Paragraph>
          </Card>
        </Space>
      </div>
    </div>
  );
};

export default HomePage;
