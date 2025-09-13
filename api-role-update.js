// Simple role update via API
// This demonstrates how to update user roles via the REST API

const API_BASE = 'http://localhost:3000/api'; // Adjust port as needed

// Function to update user role via API
async function updateUserRoleViaAPI(userId, newRole, authToken) {
  try {
    const response = await fetch(`${API_BASE}/auth/user/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` // You'll need a valid auth token
      },
      body: JSON.stringify({ role: newRole })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`User role updated successfully: ${result.data.email} is now ${result.data.role}`);
    } else {
      console.error('Failed to update role:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error updating user role:', error);
  }
}

// Example usage:
// updateUserRoleViaAPI('user_2z7oU3MvRhDNS0S6GzNCO7xDL4M', 'admin', 'your-auth-token');

module.exports = { updateUserRoleViaAPI };
