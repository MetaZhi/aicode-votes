import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import './App.css';

function App() {
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取所有建议
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/suggestions');
        setSuggestions(response.data);
        setError(null);
      } catch (err) {
        setError('获取建议失败，请稍后再试');
        console.error('获取建议失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  // 提交新建议
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    try {
      const response = await axios.post('/api/suggestions', { content: newSuggestion });
      setSuggestions([response.data, ...suggestions]);
      setNewSuggestion('');
    } catch (err) {
      setError('提交建议失败，请稍后再试');
      console.error('提交建议失败:', err);
    }
  };

  // 点赞功能
  const handleUpvote = async (id) => {
    try {
      const response = await axios.put(`/api/suggestions/${id}/upvote`);
      setSuggestions(suggestions.map(suggestion => 
        suggestion._id === id ? response.data : suggestion
      ));
    } catch (err) {
      setError('点赞失败，请稍后再试');
      console.error('点赞失败:', err);
    }
  };

  // 点踩功能
  const handleDownvote = async (id) => {
    try {
      const response = await axios.put(`/api/suggestions/${id}/downvote`);
      setSuggestions(suggestions.map(suggestion => 
        suggestion._id === id ? response.data : suggestion
      ));
    } catch (err) {
      setError('点踩失败，请稍后再试');
      console.error('点踩失败:', err);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">主播内容建议</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <Form onSubmit={handleSubmit} className="mb-5">
        <Form.Group>
          <Form.Label>提交你的建议</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={newSuggestion}
            onChange={(e) => setNewSuggestion(e.target.value)}
            placeholder="请输入你希望主播下次直播的内容建议..."
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          提交建议
        </Button>
      </Form>

      <h2 className="mb-4">所有建议</h2>
      
      {loading ? (
        <p className="text-center">加载中...</p>
      ) : suggestions.length === 0 ? (
        <p className="text-center">暂无建议，快来提交第一条吧！</p>
      ) : (
        <Row>
          {suggestions.map((suggestion) => (
            <Col md={6} lg={4} className="mb-4" key={suggestion._id}>
              <Card>
                <Card.Body>
                  <Card.Text>{suggestion.content}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleUpvote(suggestion._id)}
                      >
                        <FaThumbsUp /> <Badge bg="secondary">{suggestion.upvotes}</Badge>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDownvote(suggestion._id)}
                      >
                        <FaThumbsDown /> <Badge bg="secondary">{suggestion.downvotes}</Badge>
                      </Button>
                    </div>
                    <small className="text-muted">
                      {new Date(suggestion.createdAt).toLocaleString('zh-CN')}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default App;