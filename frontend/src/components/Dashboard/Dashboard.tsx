import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import backgroundImage from '../../assets/dashboard_back.jpg';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const statusOptions = ['todo', 'in_progress', 'done'] as const;
type TaskStatus = typeof statusOptions[number];

interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
}

const Dashboard = () => {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
  }>({
    title: '',
    description: '',
    status: 'todo',
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    fetchTasks();
    fetchUsername();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks?user_id=${user.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUsername = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/${user.id}`);
      setUsername(response.data.username);
    } catch (error) {
      setUsername('');
    }
  };

  const handleCreateTask = async () => {
    try {
      await axios.post(`${API_URL}/api/tasks`, {
        ...newTask,
        user_id: user.id,
      });
      setOpen(false);
      setNewTask({ title: '', description: '', status: 'todo' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = async () => {
    if (!currentTask) return;
    try {
      await axios.put(`${API_URL}/api/tasks/${currentTask.id}`, {
        title: currentTask.title,
        description: currentTask.description,
        status: currentTask.status,
        user_id: user.id
      });
      setOpen(false);
      setCurrentTask(null);
      setEditMode(false);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskId}?user_id=${user.id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setEditMode(true);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentTask(null);
    setNewTask({ title: '', description: '', status: 'todo' });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: any) => {
    setIsDragging(false);
    setDraggingOver(null);
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const task = tasks.find((t) => t.id === parseInt(draggableId));
    if (!task) return;
    if (task.status !== destination.droppableId) {
      try {
        await axios.put(`${API_URL}/api/tasks/${task.id}`, {
          title: task.title,
          description: task.description,
          status: destination.droppableId,
          user_id: user.id,
        });
        fetchTasks();
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const handleDragUpdate = (update: any) => {
    setDraggingOver(update.destination ? update.destination.droppableId : null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'done':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: { xs: 2, sm: 4 },
        px: { xs: 0, sm: 0 },
        overflowX: 'hidden',
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 1, sm: 3, md: 6 } }}>
        <Box
          sx={{
            mt: 2,
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FFF200' }}>
            Hi, {username || 'User'} 👋
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              mb: 2,
              position: 'relative',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
              Task Board
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => setOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Add New Task
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  fontWeight: 'bold',
                  bgcolor: 'rgba(255,255,255,0.7)',
                  borderRadius: 3,
                  boxShadow: 2,
                  ml: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
              >
                Logout
              </Button>
            </Box>
          </Paper>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            width: '100%',
            alignItems: 'stretch',
            justifyContent: 'center',
          }}
        >
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
            {statusOptions.map((status) => (
              <Box
                key={status}
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', sm: '320px', md: '0' },
                  maxWidth: { xs: '100%', md: '33%' },
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s cubic-bezier(.4,2,.6,1)',
                  transform: isDragging ? 'scale(1.08)' : 'scale(1)',
                  zIndex: isDragging ? 20 : 1,
                  boxShadow: isDragging ? '0 0 32px 8px rgba(0,0,0,0.15)' : undefined,
                  border: isDragging ? '2px solid #1976d2' : undefined,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    minHeight: '60vh',
                    maxHeight: { xs: '60vh', sm: '70vh' },
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    borderTop: `4px solid ${getStatusColor(status)}`,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, mt: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: getStatusColor(status),
                        fontWeight: 'bold',
                        textAlign: 'center',
                        mr: 1,
                      }}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Box
                      sx={{
                        background: getStatusColor(status),
                        color: '#fff',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: 16,
                      }}
                    >
                      {tasks.filter((task) => task.status === status).length}
                    </Box>
                  </Box>
                  <Droppable droppableId={status} key={status}>
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          minHeight: 120,
                          maxHeight: '60vh',
                          overflowY: 'auto',
                          background:
                            snapshot.isDraggingOver
                              ? 'rgba(56, 255, 56, 0.15)' // green when dragging over
                              : draggingOver === null && snapshot.draggingOverWith
                              ? 'rgba(255, 56, 56, 0.15)' // red when out of any column
                              : undefined,
                          transition: 'background 0.2s',
                        }}
                      >
                        {tasks.filter((task) => task.status === status).map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided: any, snapshot: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  marginBottom: 16,
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <Card
                                  sx={{
                                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                                    boxShadow: snapshot.isDragging ? 6 : 1,
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                      transition: 'all 0.3s ease',
                                    },
                                  }}
                                >
                                  <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                      {task.title}
                                    </Typography>
                                    <Typography
                                      color="textSecondary"
                                      sx={{
                                        mb: 2,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {task.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                      <IconButton
                                        onClick={() => openEditDialog(task)}
                                        size="small"
                                        sx={{
                                          color: theme.palette.primary.main,
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                          },
                                        }}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        onClick={() => handleDeleteTask(task.id)}
                                        size="small"
                                        sx={{
                                          color: theme.palette.error.main,
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                          },
                                        }}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Paper>
              </Box>
            ))}
          </DragDropContext>
        </Box>
        <Dialog
          open={open}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle sx={{ color: theme.palette.primary.main }}>
            {editMode ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={editMode ? currentTask?.title : newTask.title}
              onChange={(e) =>
                editMode
                  ? setCurrentTask({ ...currentTask!, title: e.target.value })
                  : setNewTask({ ...newTask, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editMode ? currentTask?.description : newTask.description}
              onChange={(e) =>
                editMode
                  ? setCurrentTask({ ...currentTask!, description: e.target.value })
                  : setNewTask({ ...newTask, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editMode ? currentTask?.status ?? 'todo' : newTask.status}
                label="Status"
                onChange={(e) =>
                  editMode
                    ? setCurrentTask({ ...currentTask!, status: e.target.value as TaskStatus })
                    : setNewTask({ ...newTask, status: e.target.value as TaskStatus })
                }
              >
                <MenuItem value="todo">Todo</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleDialogClose}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editMode ? handleEditTask : handleCreateTask}
              variant="contained"
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {editMode ? 'Save Changes' : 'Add Task'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard; 