require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Kết nối MySQL (XAMPP) thành công');
    app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ Lỗi kết nối DB:', err));