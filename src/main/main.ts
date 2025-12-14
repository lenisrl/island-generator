import { app, BrowserWindow, ipcMain, dialog } from 'electron'; // Ajout de ipcMain et dialog
import path from 'path';
import fs from 'fs'; // Ajout de fs

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // On sécurise un peu (standard moderne)
      contextIsolation: true, // On active l'isolation
      preload: path.join(__dirname, 'preload.js'), // On charge le pont !
    },
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); 
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
};

// --- GESTIONNAIRES IPC (SAUVEGARDE & CHARGEMENT) ---

// Utilitaire : Chemin du dossier de sauvegardes
const getSavesDir = () => {
  const userDataPath = app.getPath('userData');
  const savesDir = path.join(userDataPath, 'saves');
  // Crée le dossier s'il n'existe pas
  if (!fs.existsSync(savesDir)) {
    fs.mkdirSync(savesDir);
  }
  return savesDir;
};

// 1. Sauvegarder (Automatique)
ipcMain.handle('save-island', async (event, data) => {
  try {
    const savesDir = getSavesDir();
    // Nom du fichier : SEED_Date.json (on remplace les caractères interdits)
    const safeSeed = data.params.seed.replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeSeed}_${Date.now()}.json`;
    const filePath = path.join(savesDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true, filename }; // On renvoie le nom du fichier créé
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Write failed' };
  }
});

// 2. Lister les sauvegardes (Nouveau !)
ipcMain.handle('get-saved-islands', async () => {
  try {
    const savesDir = getSavesDir();
    const files = fs.readdirSync(savesDir).filter(file => file.endsWith('.json'));
    
    // On lit chaque fichier pour récupérer les infos de base (Seed, Date, Pop)
    // pour les afficher joliment dans la liste
    const saves = files.map(file => {
      const content = fs.readFileSync(path.join(savesDir, file), 'utf-8');
      const json = JSON.parse(content);
      return {
        filename: file,
        seed: json.params.seed,
        date: json.saveDate,
        population: json.params.population
      };
    });

    // Tri par date (le plus récent en premier)
    saves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { success: true, saves };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'List failed' };
  }
});

// 3. Charger un fichier spécifique
ipcMain.handle('load-island', async (event, filename) => {
  try {
    const savesDir = getSavesDir();
    const filePath = path.join(savesDir, filename); // On construit le chemin complet
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      return { success: true, data };
    } else {
      return { success: false, error: 'File not found' };
    }
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Read failed' };
  }
});

// --- FIN IPC ---

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});