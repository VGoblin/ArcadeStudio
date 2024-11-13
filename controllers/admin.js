"use strict";

const { Sample, Collection, Dashboard } = require("../models");
const path = require("path")
const storageService = require("../services/storage");

exports.index = async (req, res) => {
  let samples = [], collections = [];
  let backgroundType = null, backgroundUrl = null, backgroundThumbnail;
  try {
    const dashboard = await Dashboard.findOne();
    backgroundType = dashboard.backgroundType;
    if (backgroundType == 'app')
    {
      backgroundUrl = dashboard.backgroundUrl;
    }
    else
    {
      backgroundUrl = storageService.getUrl(dashboard.backgroundUrl);
    }
    backgroundThumbnail = dashboard.backgroundUrl;
    const dbSamples = await Sample.findAll({
      order: [["order", "ASC"]],
      raw: true,
    })
    dbSamples.forEach((sample) => {
      samples.push({ ...sample, url: storageService.getUrl(sample.thumbnail)/*, slug: `/${sample.author}${sample.slug}`*/ })
    })

    try {
      collections = await Collection.findAll({
        order: [
          ["order", "ASC"],
          [Chapter, "order", "ASC"],
        ],
        include: [{ model: Chapter }],
      })
    } catch (err) {
      console.log(err)
    }
  } catch (err) {
    samples = [];
  }
  res.render("admin", {
    title: "Explore",
    isAdmin: true,
    samples,
    collections,
    backgroundType,
    backgroundUrl,
    backgroundThumbnail
  });
};

exports.createSample = async (req, res) => {
  try {
    const sample = await Sample.create({
      title: null,
      author: null,
      slug: null,
      thumbnail: null,
    });
    const count = await Sample.count();

    sample.set({ order: count });
    await sample.save();

    return res.send({
      status: "success",
      sample,
    });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

exports.updateSample = async (req, res) => {
  try {
    await Sample.update(req.body, {
      where: { id: req.params.id },
    });

    return res.send({ status: "success" });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

exports.deleteSample = async (req, res) => {
  try {
    await Sample.destroy({
      where: { id: req.params.id },
    });

    return res.send({ status: "success" });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

exports.uploadSampleThumbnail = async (req, res) => {
  try {
    const thumbnail = req.file;
    const url = storageService.getUrl(thumbnail.key);
    const key = thumbnail.key;
    return res.send({ status: "success", url, key });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

exports.reorderSample = async (req, res) => {
  try {
    const order = req.body.order;
    const samples = await Promise.all(
      order.map((id) => Sample.findOne({ where: { id } }))
    );

    await Promise.all(
      samples.map((sample, i) => {
        sample.set({ order: i });
        return sample.save();
      })
    );

    return res.send({ status: "success" });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

exports.dashboardSave = async (req, res) => {
  try {
    const banner = req.body.banner;
    const dashboard = await Dashboard.findOne();
    if (!dashboard)
    {
      dashboard = await Dashboard.create({
        title: null,
        subTitle: null,
        backgroundType: banner.backgroundType,
        backgroundUrl: banner.backgroundThumbnail,
      });
    }
    else
    {
      dashboard.backgroundType = banner.backgroundType;
      dashboard.backgroundUrl = banner.backgroundThumbnail;
      await dashboard.save();
    }
    
    const updatedSamples = req.body.samples;
    await Promise.all(
      updatedSamples.map(async (sample) => {
        let temp = await Sample.findOne({ where: { id: sample.id } });
        if (temp) {
          if (sample.remove == "true")
          {
            await temp.destroy();
          }
          else
          {
            temp.set({
              title: sample.title,
              thumbnail: sample.thumbnail,
              author: sample.author,
              slug: sample.slug,
              order: parseInt(sample.order),
              description: sample.description,
              rate: parseInt(sample.rate),
            });
            await temp.save();
          }
        }
        else
        {
          await Sample.create({
            title: sample.title,
            thumbnail: sample.thumbnail,
            author: sample.author,
            slug: sample.slug,
            order: parseInt(sample.order),
            description: sample.description,
            rate: parseInt(sample.rate),
          });
        }
      })
    );

    return res.send({ status: "success" });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

exports.postBannerThumbnail = async (req, res) => {
  try {
    return res.send({
      status: "success",
      url: storageService.getUrl(req.file.key),
      key: req.file.key
    });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};