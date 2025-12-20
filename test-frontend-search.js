// 测试前端搜索功能

// 模拟组织数据（类似后端返回的数据结构）
const mockOrganizationData = [
  {
    id: 1,
    name: "技术部",
    code: "TECH",
    parentId: null,
    managerId: 1001,
    level: 1,
    status: 1,
    sortOrder: 1,
    phone: "010-12345678",
    email: "tech@company.com",
    address: "北京市朝阳区"
  },
  {
    id: 2,
    name: "前端开发组",
    code: "FRONTEND",
    parentId: 1,
    managerId: 1002,
    level: 2,
    status: 1,
    sortOrder: 1,
    phone: "010-12345679",
    email: "frontend@company.com",
    address: "北京市朝阳区"
  },
  {
    id: 3,
    name: "后端开发组",
    code: "BACKEND",
    parentId: 1,
    managerId: 1003,
    level: 2,
    status: 1,
    sortOrder: 2,
    phone: "010-12345680",
    email: "backend@company.com",
    address: "北京市朝阳区"
  },
  {
    id: 4,
    name: "人力资源部",
    code: "HR",
    parentId: null,
    managerId: 1004,
    level: 1,
    status: 1,
    sortOrder: 2,
    phone: "010-12345681",
    email: "hr@company.com",
    address: "北京市朝阳区"
  },
  {
    id: 5,
    name: "招聘组",
    code: "RECRUIT",
    parentId: 4,
    managerId: 1005,
    level: 2,
    status: 1,
    sortOrder: 1,
    phone: "010-12345682",
    email: "recruit@company.com",
    address: "北京市朝阳区"
  }
];

// 模拟 buildTreeStructure 函数
function buildTreeStructure(data) {
  const map = {};
  const result = [];
  
  // 创建映射（使用实际的字段名）
  data.forEach(item => {
    map[item.id] = { 
      ...item, 
      // 映射字段名以适配前端组件
      orgId: item.id,
      orgName: item.name,
      orgCode: item.code,
      leaderName: item.managerId ? `用户${item.managerId}` : '未设置',
      children: [] 
    };
  });
  
  // 构建树形结构
  data.forEach(item => {
    const node = map[item.id];
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(node);
    } else if (!item.parentId) {
      result.push(node);
    }
  });
  
  return result;
}

// 模拟 filterTreeData 函数
function filterTreeData(allData, searchKeyword) {
  if (!searchKeyword) {
    return allData;
  }
  
  const keyword = searchKeyword.toLowerCase();
  
  const filterNode = (node) => {
    // 检查当前节点是否匹配
    const matchCurrent = node.orgName.toLowerCase().includes(keyword) || 
                        node.orgCode.toLowerCase().includes(keyword);
    
    // 检查子节点是否匹配
    const matchChildren = node.children && node.children.some(child => filterNode(child));
    
    // 如果当前节点或子节点匹配，则保留该节点
    if (matchCurrent || matchChildren) {
      return {
        ...node,
        children: node.children ? node.children.filter(child => filterNode(child)) : []
      };
    }
    
    return null;
  };
  
  // 过滤数据
  const filteredData = allData
    .map(node => filterNode(node))
    .filter(node => node !== null);
  
  return filteredData;
}

// 测试搜索功能
function testSearch() {
  console.log('=== 测试前端搜索功能 ===');
  
  // 构建树形结构
  const treeData = buildTreeStructure(mockOrganizationData);
  console.log('原始树形数据:', JSON.stringify(treeData, null, 2));
  
  // 测试不同的搜索关键词
  const testCases = [
    { keyword: '技术', expected: '应该匹配技术部' },
    { keyword: 'TECH', expected: '应该匹配技术部' },
    { keyword: '前端', expected: '应该匹配前端开发组' },
    { keyword: 'FRONTEND', expected: '应该匹配前端开发组' },
    { keyword: '开发', expected: '应该匹配前端和后端开发组' },
    { keyword: '人力', expected: '应该匹配人力资源部' },
    { keyword: '', expected: '应该显示所有数据' }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n--- 测试用例 ${index + 1} ---`);
    console.log(`搜索关键词: "${testCase.keyword}"`);
    console.log(`期望结果: ${testCase.expected}`);
    
    const result = filterTreeData(treeData, testCase.keyword);
    console.log(`搜索结果数量: ${result.length}`);
    console.log(`搜索结果:`, JSON.stringify(result, null, 2));
    
    if (testCase.keyword) {
      // 验证搜索结果
      const foundNames = [];
      function collectNames(nodes) {
        nodes.forEach(node => {
          foundNames.push(node.orgName);
          if (node.children) collectNames(node.children);
        });
      }
      collectNames(result);
      console.log(`找到的组织名称: ${foundNames.join(', ')}`);
    }
  });
}

// 运行测试
testSearch();