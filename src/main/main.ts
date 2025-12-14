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
      webSecurity: false
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
    
    // CORRECTION : On enlève la date pour avoir un nom fixe
    const safeSeed = data.params.seed.replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeSeed}.json`; // <--- PLUS DE TIMESTAMP
    
    const filePath = path.join(savesDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true, filename };
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

// Helper pour obtenir le dossier de base des images
const getImagesBaseDir = () => {
    const userDataPath = app.getPath('userData');
    const imagesDir = path.join(userDataPath, 'saves', 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true }); // recursive crée aussi le dossier 'saves' si besoin
    }
    return imagesDir;
};


// NOUVEAU : Importer une image
// params contient { seed: string } pour savoir dans quel sous-dossier ranger l'image
ipcMain.handle('import-image', async (event, params) => {
    if (!mainWindow) return { success: false };

    // 1. Ouvrir le sélecteur de fichiers
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Sélectionner une image',
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'webp', 'gif'] }],
        properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
        try {
            const sourcePath = filePaths[0];
            const extension = path.extname(sourcePath);
            
            // 2. Préparer le dossier de destination spécifique à ce seed
            const safeSeed = params.seed.replace(/[^a-z0-9]/gi, '_');
            const seedDir = path.join(getImagesBaseDir(), safeSeed);
            if (!fs.existsSync(seedDir)) {
                fs.mkdirSync(seedDir);
            }

            // 3. Générer un nom de fichier unique (timestamp)
            const newFilename = `img_${Date.now()}${extension}`;
            const destinationPath = path.join(seedDir, newFilename);

            // 4. Copier le fichier
            fs.copyFileSync(sourcePath, destinationPath);

            // 5. Renvoyer le chemin relatif (important pour la portabilité du dossier de sauvegarde)
            // Le chemin sera sous la forme : "images/SEED_123/img_99999.jpg"
            const relativePath = path.join('images', safeSeed, newFilename).replace(/\\/g, '/'); // Force les slashs / pour la compatibilité

            return { success: true, path: relativePath };

        } catch (e) {
            console.error("Erreur copie image:", e);
            return { success: false, error: 'Copy failed' };
        }
    }
    return { success: false, error: 'Canceled' };
});


// NOUVEAU : Obtenir le chemin absolu de base pour l'affichage
// React a besoin de savoir où se trouve le dossier "saves" sur le disque pour afficher les images
ipcMain.handle('get-user-data-path', () => {
    return path.join(app.getPath('userData'), 'saves');
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});