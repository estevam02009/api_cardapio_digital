const express = require('express');
const router = express.Router();
const Marketing = require('../models/Marketing');
const Customer = require('../models/Customer');

// Criar campanha de marketing
router.post('/marketing/campaigns', async (req, res) => {
  try {
    const campaign = new Marketing(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter campanhas ativas
router.get('/marketing/campaigns', async (req, res) => {
  try {
    const { status, platform, type } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (platform) query.platform = platform;
    if (type) query.type = type;

    const campaigns = await Marketing.find(query)
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar métricas da campanha
router.patch('/marketing/campaigns/:id/metrics', async (req, res) => {
  try {
    const { metrics } = req.body;
    const campaign = await Marketing.findByIdAndUpdate(
      req.params.id,
      { $inc: metrics },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Enviar campanha para público-alvo
router.post('/marketing/campaigns/:id/send', async (req, res) => {
  try {
    const campaign = await Marketing.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Encontrar clientes que correspondem ao público-alvo
    const targetCustomers = await Customer.find({
      'membershipLevel': { $in: campaign.targetAudience.loyaltyLevel }
    });

    // Simular envio de mensagens (aqui você implementaria a integração real com as plataformas)
    const results = {
      totalSent: targetCustomers.length,
      platform: campaign.platform,
      timestamp: new Date()
    };

    campaign.status = 'active';
    await campaign.save();

    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;