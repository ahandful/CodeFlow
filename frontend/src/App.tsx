import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import { 
  DatabaseOutlined, 
  FileSearchOutlined, 
  HomeOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

import HomePage from './pages/HomePage';
import RepositoryPage from './pages/RepositoryPage';
import ReviewPage from './pages/ReviewPage';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/repositories',
      icon: <DatabaseOutlined />,
      label: '仓库管理',
    },
    {
      key: '/reviews',
      icon: <FileSearchOutlined />,
      label: '代码评审',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            CodeFlow
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Title level={4} style={{ margin: 0, lineHeight: '64px' }}>
            代码仓库管理和评审系统
          </Title>
        </Header>
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/repositories" element={<RepositoryPage />} />
            <Route path="/reviews" element={<ReviewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
