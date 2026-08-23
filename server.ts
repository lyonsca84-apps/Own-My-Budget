import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getAuth } from "./firebaseAdmin";
import { listAllUsers, updateUserRole, deleteUserAccount } from "./services/usersService";
import { getAnalytics } from "./services/analyticsService";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let privateKey = process.env.GOOGLE_PRIVATE_KEY;
let clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
let projectId = process.env.GOOGLE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

if (privateKey) {
  // 1. Basic cleaning
  privateKey = privateKey.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  
  // 2. Handle Base64 encoding (common for env vars)
  if (!privateKey.includes('-----BEGIN')) {
    try {
      const decoded = Buffer.from(privateKey, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN') || decoded.includes('{')) {
        privateKey = decoded;
      }
    } catch (e) {
      // Not base64 or failed to decode
    }
  }

  // 3. Handle JSON Service Account
  if (privateKey.includes('{')) {
    try {
      const start = privateKey.indexOf('{');
      const end = privateKey.lastIndexOf('}');
      const json = JSON.parse(privateKey.substring(start, end + 1));
      privateKey = json.private_key || privateKey;
      clientEmail = json.client_email || clientEmail;
      projectId = json.project_id || projectId;
    } catch (e) {
      // Not valid JSON
    }
  }

  // 4. Normalize PEM format
  // Replace literal \n and \r, and also handle cases where they might be double escaped
  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\n/g, '\n') // Ensure actual newlines are preserved
    .trim();
  
  // Ensure it has the correct PEM header/footer if it looks like a key
  if (privateKey && !privateKey.includes('-----BEGIN')) {
    // Remove all whitespace if it's just the base64 body
    const cleanKey = privateKey.replace(/\s/g, '');
    if (cleanKey.length > 100) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`;
    }
  }
}

if (clientEmail && privateKey && projectId) {
  try {
    if (!admin.apps.length) {
      const config = {
        projectId: projectId.trim(),
        clientEmail: clientEmail.trim(),
        privateKey: privateKey.trim(),
      };
      
      console.log(`Initializing Firebase Admin for project: ${config.projectId}`);
      console.log(`Client Email: ${config.clientEmail}`);
      console.log(`Private Key length: ${config.privateKey.length}`);
      console.log(`Private Key starts with: ${config.privateKey.substring(0, 20)}...`);
      console.log(`Private Key ends with: ...${config.privateKey.substring(config.privateKey.length - 20)}`);

      admin.initializeApp({
        credential: admin.credential.cert(config),
        databaseURL: `https://${config.projectId}.firebaseio.com`
      });
      console.log("Firebase Admin initialized successfully.");
    }
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
} else {
  console.warn("Missing Firebase Admin credentials. Some features may not work.");
  if (!clientEmail) console.warn("- Missing GOOGLE_CLIENT_EMAIL");
  if (!privateKey) console.warn("- Missing GOOGLE_PRIVATE_KEY");
  if (!projectId) console.warn("- Missing GOOGLE_PROJECT_ID");
}

const GCIP_API_BASE = 'https://identitytoolkit.googleapis.com/v2';
const SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

async function getAccessToken() {
  if (!clientEmail || !privateKey) {
    throw new Error("GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY are required for Google Auth.");
  }

  const jwtClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });
  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

// Middleware to verify Admin
const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Check if the user is the owner
    const ownerEmail = 'lyonsca84@gmail.com';
    if (decodedToken.email !== ownerEmail) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

async function addIdpConfig(projectId: string, accessToken: string, idpId: string, clientId: string, clientSecret: string) {
  const uri = `${GCIP_API_BASE}/projects/${projectId}/defaultSupportedIdpConfigs?idpId=${idpId}`;
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `projects/${projectId}/defaultSupportedIdpConfigs/${idpId}`,
      enabled: true,
      clientId: clientId,
      clientSecret: clientSecret,
    }),
  };
  
  const response = await fetch(uri, options);
  if (response.ok) {
    return response.json();
  } else if (response.status === 409) {
    throw new Error('IdP configuration already exists. Update it instead.');
  } else {
    const errorData = await response.json().catch(() => ({}));
    console.error("Firebase API Error:", errorData);
    throw new Error(`Server error: ${response.statusText}`);
  }
}

async function updateIdpConfig(projectId: string, accessToken: string, idpId: string, clientId: string, clientSecret: string) {
  const uri = `${GCIP_API_BASE}/projects/${projectId}/defaultSupportedIdpConfigs/${idpId}?updateMask=clientId,clientSecret,enabled`;
  const options = {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      enabled: true,
      clientId: clientId,
      clientSecret: clientSecret,
    }),
  };
  
  const response = await fetch(uri, options);
  if (response.ok) {
    return response.json();
  } else {
    const errorData = await response.json().catch(() => ({}));
    console.error("Firebase API Error:", errorData);
    throw new Error(`Server error: ${response.statusText}`);
  }
}

async function enableEmailAuth(projectId: string, accessToken: string) {
  const uri = `${GCIP_API_BASE}/projects/${projectId}/config?updateMask=signIn.email.enabled`;
  const options = {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      signIn: {
        email: {
          enabled: true
        }
      }
    }),
  };

  const response = await fetch(uri, options);
  if (response.ok) {
    return response.json();
  } else {
    const errorData = await response.json().catch(() => ({}));
    console.error("Firebase API Error:", errorData);
    throw new Error(`Server error: ${response.statusText}`);
  }
}

async function getAuthStatus(projectId: string, accessToken: string) {
  const uri = `${GCIP_API_BASE}/projects/${projectId}/config`;
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  };

  const response = await fetch(uri, options);
  if (response.ok) {
    return response.json();
  } else {
    const errorData = await response.json().catch(() => ({}));
    console.error("Firebase API Error:", errorData);
    throw new Error(`Server error: ${response.statusText}`);
  }
}

async function listIdpConfigs(projectId: string, accessToken: string) {
  const uri = `${GCIP_API_BASE}/projects/${projectId}/defaultSupportedIdpConfigs`;
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  };

  const response = await fetch(uri, options);
  if (response.ok) {
    return response.json();
  } else {
    const errorData = await response.json().catch(() => ({}));
    console.error("Firebase API Error:", errorData);
    throw new Error(`Server error: ${response.statusText}`);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Admin Routes
  app.get("/api/admin/users", verifyAdmin, async (req, res) => {
    try {
      const users = await listAllUsers();
      res.json({ success: true, users });
    } catch (error: any) {
      console.error("List Users Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/users/:uid/role", verifyAdmin, async (req, res) => {
    try {
      const { uid } = req.params;
      const { role } = req.body;

      await updateUserRole(uid, role);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update Role Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:uid", verifyAdmin, async (req, res) => {
    try {
      const { uid } = req.params;

      await deleteUserAccount(uid);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete User Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/analytics", verifyAdmin, async (req, res) => {
    try {
      const analytics = await getAnalytics();
      res.json({ success: true, analytics });
    } catch (error: any) {
      console.error("Analytics Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route to manage Firebase Auth IdP Configs
  app.post("/api/auth/configure-idp", async (req, res) => {
    try {
      const { projectId, idpId, clientId, clientSecret } = req.body;
      
      if (!projectId || !idpId || !clientId || !clientSecret) {
        return res.status(400).json({ error: "Missing required fields: projectId, idpId, clientId, clientSecret" });
      }

      const accessToken = await getAccessToken();
      let result;
      try {
        result = await addIdpConfig(projectId, accessToken, idpId, clientId, clientSecret);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          result = await updateIdpConfig(projectId, accessToken, idpId, clientId, clientSecret);
        } else {
          throw error;
        }
      }
      
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Configure IdP Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/enable-email", async (req, res) => {
    try {
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: "Missing required field: projectId" });
      }

      const accessToken = await getAccessToken();
      const result = await enableEmailAuth(projectId, accessToken);
      
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Enable Email Auth Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/status", async (req, res) => {
    try {
      const { projectId } = req.query;
      
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ error: "Missing required query parameter: projectId" });
      }

      const accessToken = await getAccessToken();
      const config = await getAuthStatus(projectId, accessToken);
      const idps = await listIdpConfigs(projectId, accessToken);
      
      res.json({ 
        success: true, 
        data: {
          ...config,
          idps: idps.defaultSupportedIdpConfigs || []
        } 
      });
    } catch (error: any) {
      console.error("Get Auth Status Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
