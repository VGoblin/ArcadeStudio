import { h, Component, PureComponent, render, Fragment, createContext } from "preact"
import { useRef, useContext } from "preact/hooks"
import { createPortal, memo } from "preact/compat"
import classNames from "classnames"
import { useState, useCallback, useEffect } from "preact/hooks"
import Masonry from "react-masonry-css"
import { ContextMenu, ContextMenuTrigger } from "preact-context-menu"
import { css, cx } from "@emotion/css"
import * as dayjs from "dayjs"
import * as utc from "dayjs/plugin/utc"
dayjs.extend(utc)
import Lottie from "react-lottie-player"
import AnimateHeight from "react-animate-height"
import Masonry2, { ResponsiveMasonry } from "react-responsive-masonry"
import useInfiniteScroll from "react-infinite-scroll-hook"
import { useDebouncedCallback } from "use-debounce"
import ReactHowler from "react-howler"
import { isBrowser, isMobile } from "react-device-detect"

// stop playing audio when you leave the tab

const projectsInitItem = "projects"

const Context = createContext({})

class Tabs extends Component {
  constructor(props) {
    super(props)
    this.activeItem = projectsInitItem
    this.data = {}
  }
  state = {
    activeItem: projectsInitItem,
    openItem: null,
    draggingItemId: null,
    portalMenu: false,
    adding: [],
    accordionOpenIds: [],
    accordionInitialOpenIds: [], // prevents loading data before accordion open
    creatingFolder: false,
  }
  componentDidMount() {
    this.updateMenuState()
    $(document).on("top-menu-change", () => {
      this.updateMenuState(true)
    })

    // menuItems.map((item, index) => {
    //   setTimeout(()=> {
    //     this.onMenuClick(item);
    //     setTimeout(()=>this.onMenuClick(item), 100);
    //   }, 100 * index);
    // });
  }
  // menu
  updateMenuState(init) {
    const assetsMenuSelected = true;//$(".tab-item[data-target=js-accordion-assets]").hasClass("active")
    this.setState({
      portalMenu: assetsMenuSelected,
    })

    if (assetsMenuSelected && (init || this.activeItem === projectsInitItem)) {
      this.setState({ activeItem: projectsInitItem })
      $("#tab-project").addClass("open")

      // this.onMenuClick(menuItems[4]) // for testing
    } else {
      $("#tab-project").removeClass("open")
    }
  }
  onMenuClick = (item) => {
    this.activeItem = item.name
    this.setState({ activeItem: item.name, openItem: null })
    this.closeAllAccordions()

    this.getData(item)
    this.updateMenuState()

    let exampleData = {
      title: '',
      vimeoId: '',
      description: '',
      thumbUrl: '',
    };
  }

  // data
  getData(item) {
    this.setState({ loading: true })

    if (item.name === "video") {
      this.data[item.name] = [{ name: "pixabay", pixabay: true }]
      if (this.state[item.name]) {
        setTimeout(() => {
          this.setState({ loading: false })
        }, 500)
        return
      }

      this.getMyData()
      return
    }

    if (!item.url) return

    if (this.state[item.name]) {
      setTimeout(() => {
        this.setState({ loading: false })
      }, 500)
      return
    }

    $.get(item.url, (data) => {
      data = parseData(data)
      if (item.name === "images") {
        data = insert(data, 0, { name: "unsplash", unsplash: true })
      }
      this.data[item.name] = data
      this.getMyData()
    })
  }
  getMyName() {
    return menuItems.find((i) => i.name === this.activeItem).myName
  }
  getMyData(cb) {
    const name = this.activeItem
    if (name === projectsInitItem) return

    $.get("/asset/my-" + this.getMyName(), (myData) => {
      this.setState({
        [name]: [
          { my: true, name: "My " + name, accordion: true, items: myData },
          ...this.data[name].filter((i) => !i.my),
        ],
      })
      setTimeout(() => {
        this.setState({ loading: false })
      }, 500)
      typeof cb === "function" && cb()
    })
  }
  addToMy(e, id) {
    const name = this.getMyName()

    if (this.isMyDataContains(id) || this.isAddingId(id)) return

    this.startSpinnerId(id)

    $.post(`/asset/my-${name}/add`, { id, folderId: 0 }, () => {
      this.getMyData(() => {
        this.stopSpinnerId(id)
      })
    })
  }
  uploadToMy(e, type, url, id) {
    if (this.isMyDataContains(id) || this.isAddingId(id)) return
    this.startSpinnerId(id)

    let fileName = new URL(url).pathname.split("/").pop()
    if (type === "Image") {
      const ext = url.match(/fm=([^&]*)&/)[1]
      fileName += "." + ext
    }
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], fileName, { type: blob.type })
        const formData = new FormData()
        formData.append("type", type)
        formData.append("file", file)

        fetch(`/asset/my-${type}/upload`, {
          method: "POST",
          body: formData,
        }).then((res) => {
          this.getMyData(() => {
            this.stopSpinnerId(id)
          })
        })
      })
      .catch((err) => {
        this.stopSpinnerId(id)
        console.error(err)
      })
  }
  deleteFromMy(e, id) {
    const name = this.getMyName()
    this.startSpinnerId(id)
    $.post(`/asset/my-${name}/delete`, { id }, () => {
      this.getMyData(() => {
        this.stopSpinnerId(id)
      })
    })
  }
  isAddingId(id) {
    return this.state.adding.find((a) => a.name === this.getMyName() && a.id === id)
  }
  startSpinnerId(id) {
    this.setState({ adding: [...this.state.adding, { name: this.getMyName(), id }] })
  }
  stopSpinnerId(id) {
    this.setState({
      adding: this.state.adding.filter((a) => !(a.name === this.getMyName() && a.id === id)),
    })
  }
  // actions
  toggleAccordion(id) {
    if (this.isAccordionIdOpen(id)) {
      this.closeAccordion(id)
    } else {
      this.openAccordion(id)
    }
  }
  openAccordion(id) {
    this.setState({
      accordionOpenIds: [...this.state.accordionOpenIds, id],
      accordionInitialOpenIds: [...this.state.accordionInitialOpenIds, id],
    })
  }
  closeAllAccordions() {
    this.setState({ accordionOpenIds: [] })
  }
  closeAccordion(id) {
    this.setState({
      accordionOpenIds: this.state.accordionOpenIds.filter((openId) => openId !== id),
    })
  }
  isMyDataContains(id) {
    const data = this.state[this.state.activeItem]
    if (!data) return false

    return data[0].items.find((folder) =>
      folder.items.find((d) => d[this.getMyName() + "Id"] === id)
    )
  }
  isMyDataOpened() {
    return this.state.openItem && this.state.openItem.startsWith("My")
  }
  getContext() {
    const { adding, activeItem, openItem, accordionOpenIds } = this.state
    const myName = this.getMyName()
    return {
      myName,
      myDataContains: (id) => this.isMyDataContains(id),
      addingToMy: (id) => this.addingToMy(id),
      onAddToMyClick: (e, id) => {
        if (this.isMyDataOpened()) return

        this.addToMy(e, id)
      },
      uploadToMy: (e, type, url, id) => this.uploadToMy(e, type, url, id),
      onDeleteClick: (id) => {
        $.post("/folder/delete/" + id, () => {
          this.getMyData()
        })
      },
      isAccordionIdOpen: (id) => this.isAccordionIdOpen(id),
      isAccordionIdInitialOpen: (id) => this.isAccordionIdInitialOpen(id),
      activeItem: activeItem,
      isMyItemOpened: this.isMyDataOpened(),
      toggleAccordion: (id) => this.toggleAccordion(id),
      onDragStart: (draggingItemId) => {
        setTimeout(() => {
          this.closeAllAccordions()
          this.setState({ draggingItemId })
        }, 1)
      },
      deleteFromMy: (e, id) => this.deleteFromMy(e, id),
    }
  }
  addingToMy = (id) => this.isAddingId(id)
  isAccordionIdOpen = (id) => this.state.accordionOpenIds.indexOf(id) > -1
  isAccordionIdInitialOpen = (id) => this.state.accordionInitialOpenIds.indexOf(id) > -1

  renderData() {
    const { openItem, activeItem, loading, creatingFolder } = this.state

    // projects
    if (activeItem === projectsInitItem) {
      return
    }

    if (loading) 
     return;
    // return <div>Loading...</div>

    // list of initial items
    if (!openItem) {
      if ($(".tab-item.js-accordion-item." + activeItem + " .js-accordion-body").html() == '')
        render(this.renderCategories(), $(".tab-item.js-accordion-item." + activeItem + " .js-accordion-body")[0]);
      return;
    }

    const data = this.state[this.state.activeItem]
    const data1 = data.find(({ name }) => name === openItem)

    // item with different types of data
    $("#js-accordion-menu").css("display", "none");
    $("#js-accordion-assets-context").css("display", "flex");
    render( (
      <div style={{display: "flex", flexDirection: "column", overflow: "hidden", height: "100%"}}>
        <TopButtons
          onGoBackClick={() => setTimeout(() => {
            this.setState({ openItem: null });
            $("#js-accordion-menu").css("display", "flex");
            $("#js-accordion-assets-context").css("display", "none");
          }, 1)}
          showCreateFolderButton={data1.my}
          onCreateFolderClick={() => {
            this.setState({ creatingFolder: true })
            $.post("/folder/create", { type: this.getMyName(), name: "Untitled" }, () => {
              this.getMyData(() => {
                this.setState({ creatingFolder: false })
              })
            })
          }}
          onImport={(e) => {
            const formData = new FormData()

            let folderId = $(".AccordionList .accordionItem.active").data("id");
            if (!folderId)
              return;
            formData.append("type", "Geometry")
            formData.append("folderId", folderId)

            const files = e.target.files
            for (let i = 0; i < files.length; i++) {
              formData.append(`file`, files[i])
            }

            fetch("/asset/my-geometry/upload", {
              method: "POST",
              body: formData,
            }).then((response) => this.getMyData())
          }}
          creatingFolder={creatingFolder}
          enableImport={data1.my && data1.name !== "My materials"}
        />
        <Context.Provider value={this.getContext()}>{this.renderOpenCategory()}</Context.Provider>
      </div>
    ), $("#js-accordion-assets-context")[0]);

    return (<div></div>)
  }
  renderCategories() {
    const data = this.state[this.state.activeItem]

    if (!data) return

    return (
      <Context.Provider value={this.getContext()}>
        <div
          class={classNames(
            "categories",
            css`
              display: grid;
              --n: ${isBrowser ? "4" : "1"};
              grid-template-columns: repeat(auto-fill, minmax(max(200px, 100% / var(--n)), 1fr));
            `
          )}
        >
          {data.map(
            ({
              id,
              name,
              my,
              thumbUrl = "https://assets.website-files.com/616a041ea72c58e139ed3c8e/616a041ea72c58999ded3dc1_my-heartdrive.png",
            }) => {
              const thumbs = {
                "99sounds":
                  "https://arcadestudio-assets.s3.us-east-2.amazonaws.com/gallery/audio/99sounds.png",
                unsplash:
                  "https://arcadestudio-assets.s3.us-east-2.amazonaws.com/gallery/images/unsplash.png",
                Kane:
                  "https://arcadestudio-assets.s3.us-east-2.amazonaws.com/gallery/images/kane-gallery.png",
                pixabay:
                  "https://arcadestudio-assets.s3.us-east-2.amazonaws.com/gallery/video/pixabay.png",
                Lottie:
                  "https://arcadestudio-assets.s3.us-east-2.amazonaws.com/gallery/animations/lottie.png",
              }
              if (thumbs[name]) {
                thumbUrl = thumbs[name]
              }
              if (this.addingToMy(id)) {
                return <Spinner />
              }
              return (
                <CategoriesItem
                  id={id}
                  name={name}
                  thumbUrl={thumbUrl}
                  onOpenItemClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (this.activeItem === "environment" && name !== "My environment") {
                      this.addToMy(e, id)
                      return;
                    }
                    this.setState({ openItem: name })
                  }}
                  isMyData={my}
                />
              )
            }
          )}
        </div>
      </Context.Provider>
    )
  }

  renderOpenCategory() {
    const data = this.state[this.state.activeItem]
    const data1 = data.find(({ name }) => name === this.state.openItem)

    if (data1.unsplash) return <Unsplash />

    if (data1.pixabay) return <Pixabay />

    // render items
    if (!data1.accordion) {
      return (
        <div
          class={css`
            padding-top: 30px;
          `}
        >
          <Items data={data1} noneBorder={true}/>
        </div>
      )
    }

    // render accordion
    return (
      <div
        class={css`
          padding-top: 30px;
          overflow: scroll;
          height: 100%;
        `}
      >
        {/* LEVEL 1 ------------------------------------------------------------- */}
        {data1.items.map((data2) => {
          return (
            <div 
              class="AccordionList"
              onClick={() => {
                $(".slide-menu").hide();
              }}
            >
              <AccordionHead
                data={data2}
                onItemDrop={(e) => {
                  const folderId = data2.id
                  $(e.target.closest(".accordionItem")).removeClass("hover");
                  $.post(
                    `/asset/my-${this.getMyName()}/update/` + this.state.draggingItemId,
                    { folderId },
                    () => {
                      this.getMyData(() => {
                        setTimeout(() => {
                          this.openAccordion(folderId)
                        }, 100)
                      })
                    }
                  )
                  this.setState({ draggingItemId: null })
                }}
                onNameUpdate={(value) => {
                  // TODO: post if the name is changed
                  $.post("/folder/update/" + data2.id, { name: value }, () => {
                    this.getMyData()
                  })
                }}
                // onImport={(e) => {
                //   const formData = new FormData()

                //   formData.append("type", "Geometry")
                //   formData.append("folderId", data2.id)
                //   // formData.append("projectId", 1272)

                //   const files = e.target.files
                //   for (let i = 0; i < files.length; i++) {
                //     formData.append(`file`, files[i])
                //   }

                //   fetch("/asset/my-geometry/upload", {
                //     method: "POST",
                //     body: formData,
                //   }).then((response) => this.getMyData())
                // }}
                disableContextMenu={data2.name === "Recent"}
                enableImport={data1.my && data1.name !== "My materials"}
              />
              <AnimateHeight
                duration={400}
                height={this.isAccordionIdOpen(data2.id) ? "auto" : 0}
                delay={200}
              >
                {this.isAccordionIdInitialOpen(data2.id) && <Items data={data2} />}
              </AnimateHeight>
            </div>
          )
        })}
      </div>
    )
  }

  render({}, { activeItem, portalMenu }) {
    return (
      <div style="background: black">
        {this.renderData()}
        <Menu portalMenu={portalMenu} activeItem={activeItem} onClick={this.onMenuClick} />
      </div>
    )
  }
}

const TopButtons = ({
  onGoBackClick,
  showCreateFolderButton,
  onCreateFolderClick,
  creatingFolder,
  enableImport,
  onImport
}) => {
  return (
    <div
      class={classNames(
        "top-buttons",
        css`
          position: absolute;
          display: flex;
          justify-content: space-between;
          flex-direction: row;
          width: 100%;
          padding: 3px 8px;
          align-items: center;
          border-bottom: 0.5px solid #1e2742;
          background: black;
          z-index: 2;
        `
      )}
    >
      <button
        onClick={onGoBackClick}
        class={css`
          &,
          &:hover,
          &:focus {
            background: none;
          }
        `}
      >
        <div
          class={css`
            display: -webkit-box;
            display: -webkit-flex;
            display: -ms-flexbox;
            display: flex;
            width: 14px;
            height: 14px;
            margin-left: 4px;
            -webkit-box-pack: center;
            -webkit-justify-content: center;
            -ms-flex-pack: center;
            justify-content: center;
            -webkit-box-align: center;
            -webkit-align-items: center;
            -ms-flex-align: center;
            align-items: center;
            border-style: none none solid solid;
            border-width: 1px;
            border-color: #7292db;
            border-radius: 0px 0px 0px 4px;
            -webkit-transform: rotate(45deg);
            -ms-transform: rotate(45deg);
            transform: rotate(45deg);
            cursor: pointer;
          `}
        />
      </button>
      <div class={css`
        flex: 1;
        display: flex;
        margin-right: 12px;
        justify-content: flex-end;
        gap: 12px;
      `}>
        <input
          id={"input_file"}
          type="file"
          multiple
          onChange={onImport}
          style={{ display: "none" }}
        />
        {enableImport && (
          <div
            onClick={() => $("#input_file").click()}
            class={css`
              display: flex;
              width: 18px;
              height: 18px;
              justify-content: center;
              align-items: center;
              border: 1px solid #48648f;
              border-radius: 2px;
              &,
              &:hover,
              &:focus {
                background: none;
              }
              cursor: pointer;
            `}
          >
            <img
              src="https://assets.website-files.com/616a041ea72c58e139ed3c8e/616a041ea72c583813ed3ca9_plus.png"
              alt=""
              class={css`
                max-width: 40%;
                vertical-align: middle;
                display: inline-block;
              `}
            />
          </div>
        )}
        {showCreateFolderButton && (
          <div
            onClick={onCreateFolderClick}
            class={css`
            display: flex;
              width: 18px;
              height: 18px;
              justify-content: center;
              align-items: center;
              &,
              &:hover,
              &:focus {
                background: none;
              }
              cursor: pointer;
            `}
          >
            {creatingFolder ? (
              <Spinner size={1} />
            ) : (
              <img
                src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/control-panel/new-folder.svg"
                alt=""
                class={css`
                  max-width: 100%;
                  vertical-align: middle;
                  display: inline-block;
                `}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const AccordionHead = ({
  data,
  onItemDrop,
  onNameUpdate,
  onImport,
  disableContextMenu,
  enableImport,
}) => {
  const { onDeleteClick, isMyItemOpened, toggleAccordion, isAccordionIdOpen } = useContext(Context)

  return (
    <div
      key={data.id}
      data-id={data.id}
      onDrop={isMyItemOpened && onItemDrop}
      onDragOver={
        isMyItemOpened
          ? (e) => {
              // console.log("dragover", e);
              $(e.target.closest(".accordionItem")).addClass("hover");
              e.stopPropagation()
              e.preventDefault()
            }
          : false
      }
      onDragLeave={(e) => {
        // console.log("dragleave", e);
        $(e.target.closest(".accordionItem")).removeClass("hover");
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        $(".slide-menu").hide();
        var folderItemMenu = $($(e.target).parent().find(".slide-menu")[0]);
        if (folderItemMenu.parent().length > 0) {
          var { top, left } = folderItemMenu.parent()[0].getBoundingClientRect();
          folderItemMenu.css("left", ( e.clientX - left ) + 'px' );
          folderItemMenu.css("top", ( e.clientY - top ) + 'px' );
          folderItemMenu.show();
        }
      }}
      onClick={(e) => {
        if (e.target.closest("input").hasAttribute("readOnly"))
          toggleAccordion(data.id)
      }}
      class={classNames(
        "accordionItem",
        isAccordionIdOpen(data.id) ? "active" : "",
        css`
          display: flex;
          height: auto;
          justify-content: space-between;
          flex: 0 0 auto;
          padding-right: 0px;
          padding-left: 15px;
          border-bottom: 0.5px solid #1e2742;
          width: 100%;
          height: 100%;
          height: 30px;
          align-items: center;
          button {
            display: none;
          }
          &:hover,
          &:focus {
            background-color: #0f141e;
            button {
              display: block;
            }
          }
          &.hover, &.active {
            background-color: #1e2742;
            button {
              display: block;
            }
          }
          cursor: pointer;
          & > span {
            display: flex;
            width: 100%;
            height: 30px;
          }
          ${slideMenuParentCSS}
        `
      )}
    >
      {/*TODO: only use for my things*/}
      {/* <ContextMenuTrigger
        id={data.id}
        class={css`
          display: block;
        `}
        disabled={disableContextMenu}
      > */}
      <InlineEdit
        class={classNames("title")}
        value={data.name}
        setValue={onNameUpdate}
        forceReadOnly={disableContextMenu}
      />
      {/* </ContextMenuTrigger> */}
      {!disableContextMenu && <div
        class={classNames(
          "slide-menu FolderItemMenu"
        )}
      >
        <div
          onClick={(e) => onDeleteClick(data.id)}
        >Delete</div>
      </div>}
      {/* <input
        id={"input" + data.id}
        type="file"
        multiple
        onChange={onImport}
        style={{ display: "none" }}
      />
      {enableImport && (
        <button
          onClick={() => $("#input" + data.id).click()}
          class={css`
            font-family: Exo, sans-serif;
            background: #111218;
            height: 100%;
            &:hover,
            &:focus {
              background: #1d202b;
            }
            font-size: 12px;
            font-weight: 200;
            white-space: nowrap;
            color: #7292db;
            padding: 0 20px;
            text-transform: none;
          `}
        >
          Import
        </button>
      )} */}
    </div>
  )
}

const Items = ({ data, noneBorder }) => {
  let {
    activeItem,
    isMyItemOpened,
    addingToMy,
    myName,
    onAddToMyClick,
    onDeleteClick,
    myDataContains,
    isAccordionIdOpen,
    isAccordionIdInitialOpen,
    onDragStart,
  } = useContext(Context)

  if (activeItem === "images") {
    return (
      <div class={classNames("accordion-body")} style={{ borderBottom: (noneBorder ? "none" : "0.5px solid #1e2742"), padding: "15px"}}>
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 2 }}>
          <Masonry2 gutter="10px">
            {data.items.map((data3) => {
              return (
                <div
                  class={css`
                    width: 100%;
                    cursor: pointer;
                    position: relative;
                  `}
                  ondragstart={() => onDragStart(data3.id)}
                  onClick={(e) => onAddToMyClick(e, data3.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
		                e.stopPropagation();
                    $(".slide-menu").hide();
                    var { top, left } = $(e.target).parent()[0].getBoundingClientRect();
                    var folderItemMenu = $(e.target).parent().find(".slide-menu");
                    folderItemMenu.css("left", ( e.clientX - left ) + 'px' );
                    folderItemMenu.css("top", ( e.clientY - top ) + 'px' );
                    folderItemMenu.show();
                  }}
                >
                  {addingToMy(data3.id) && <Spinner isMasonry={true} />}
                  <SlideMenu id={data3.id} />
                  <Heart id={data3.id} />

                  <img
                    src={data3.thumbUrl || data3.url}
                    // loading="lazy"
                    class={classNames(
                      "accordion-item-image",
                      css`
                        display: block;
                        width: 100%;
                        ${addingToMy(data3.id) && ""}
                      `
                    )}
                  />
                </div>
              )
            })}
          </Masonry2>
        </ResponsiveMasonry>
      </div>
    )
  }

  let gridN = 4
  if (activeItem === "animation") {
    gridN = 5
  }

  let templateColumns = "1fr 1fr 1fr";
  let gridGap = 0;
  let padding = 15;
  if (activeItem === "video" || activeItem === "environment" || activeItem === "audio" || activeItem === "animation") {
    templateColumns = "repeat(auto-fill, minmax(max(200px, 100% / var(--n)), 1fr))";
    if (activeItem !== "audio")
      gridGap = 20;
  }

  const [activeAudio, setActiveAudio] = useState("");
  if (activeItem == "audio")
  {
    padding = 0;
  }
  const grid = css`
    display: grid;
    --n: ${gridN};
    grid-template-columns: ${templateColumns};
    grid-template-rows: masonry;
    grid-gap: ${gridGap}px;
    padding: ${padding}px;
    border-bottom: ${noneBorder ? "none" : "0.5px solid #1e2742"};
  `

  return (
    <div class={classNames(
        "accordionItemContainer",
        data.accordion ? "" : grid
      )}>
      {data.items.map((data2) => {
        // if (addingToMy(data2.id)) {
        //   return <Spinner isMasonry={true} size={activeItem === "audio" ? 2 : 10} />
        // }

        if (data.accordion) {
          return (
            <div>
              {<Spinner isMasonry={true} size={activeItem === "audio" ? 2 : 10} />}
              <AccordionHead data={data2} />
              <AnimateHeight
                duration={300}
                height={isAccordionIdOpen(data2.id) ? "auto" : 0}
                delay={200}
              >
                {isAccordionIdInitialOpen(data2.id) && <Items style={{borderBottom: "0.5px solid #1e2742"}} data={data2} />}
              </AnimateHeight>
            </div>
          )
        }

        if (activeItem === "audio" && data2.url) {
          return <Audio id={data2.id} name={data2.name} src={data2.url} activeAudio={activeAudio} setActiveAudio={setActiveAudio}/>
        }

        if (activeItem === "environment") {
          return (
            <CategoriesItem
              id={data2.id}
              name={data2.name}
              thumbUrl={data2.thumbUrl}
              isMyData={true}
            />
          )
        }

        if (activeItem === "animation" && data2.url) {
          return <LottieItem id={data2.id} name={data2.name} url={data2.url} />
        }

        if (activeItem === "video" && data2.url) {
          return <PixabayVideo name={data2.name} id={data2.id} url={data2.url} />
        }

        return (
          <div
            class="accordion-item"
            style={{position: "relative"}}
            onDragStart={() => onDragStart(data2.id)}
            draggable={isMyItemOpened}
            onClick={(e) => {
              onAddToMyClick(e, data2.id)
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              $(".slide-menu").hide();
              var { top, left } = $(e.target).parent()[0].getBoundingClientRect();
              var folderItemMenu = $(e.target).parent().find(".slide-menu");
              folderItemMenu.css("left", ( e.clientX - left ) + 'px' );
              folderItemMenu.css("top", ( e.clientY - top ) + 'px' );
              folderItemMenu.show();
            }}
          >
            {addingToMy(data2.id) && <Spinner isMasonry={true} />}
            <div
              class={css`
                display: flex;
                width: 100%;
                height: 100px;
                margin-bottom: 0px;
                -webkit-box-pack: center;
                justify-content: center;
                -webkit-box-align: center;
                align-items: flex-start;
                border-radius: 0px;
                background-image: none;
                background-position: 0px 0px;
                background-size: auto;
                background-repeat: repeat;
                background-attachment: scroll;
                cursor: pointer;
                ${slideMenuParentCSS}
              `}
            >
              <SlideMenu id={data2.id} borderRadius={0} />
              <Heart id={data2.id} />

              <img
                src={data2.thumbUrl || data2.url}
                loading="lazy"
                class={classNames(
                  "accordion-item-image",
                  css`
                    width: 60px;
                    max-height: 60px;
                  `
                )}
              />
              <span  class={classNames(
                "Text",
                css`
                text-align: center;
                width: 100%;
                white-space: nowrap;
                overflow: hidden !important;
                text-overflow: ellipsis;
                text-transform: capitalize;
                display: inline-block;
                width: 60px;
                position: absolute;
                bottom: 10px;
                left: 50%;
                margin-left: -30px;
              `)} style="display: inline-block; vertical-align: middle;">{data2.name}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const slideMenuParentCSS =
  "position: relative; &:hover > .slide-menu {transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); opacity: 1; transform-style: preserve-3d;}"

const SlideMenu = ({ borderRadius, id }) => {
  const { isMyItemOpened, deleteFromMy } = useContext(Context)
  if (!isMyItemOpened) return

  const borderRadiusCSS = borderRadius ? `border-radius: ${borderRadius}px 0px 0px ${borderRadius}px;` : ""
  return (
    <div
      class={classNames(
        "slide-menu FolderItemMenu"
      )}
    >
      <div
        onClick={(e) => deleteFromMy(e, id)}
      >Delete</div>
    </div>
  )
}

const HeartParentCSS = "position: relative; "

const Heart = ({ id, audio, animation, environment }) => {
  const { isMyItemOpened, myDataContains } = useContext(Context)
  if (isMyItemOpened) return
  // if (!myDataContains(id))
  //   return (
  //     <div
  //       class={css`
  //         padding-left: 19px;
  //       `}
  //     ></div>
  //   )
  const Image = () => (
    <div
      class={classNames(
        `${audio ? `heart ${myDataContains(id) ? "Like" : "Unlike"}` : ''}`,
        css`
        background-color: ${environment ? "rgba(60,68,88,0.81)" : "none"};
        margin-right: ${environment ? "8px" : "0px"};
        padding: ${environment ? "4px" : "0px"};
        border-radius: ${audio ? "0px" : "0px 0px 6px 6px"};
      `)}
    >
      <img
        class={css`
          width: ${animation ? '30px' : (audio ? "14px" : "18px")};
        `}
        src={myDataContains(id) ? "https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/heart-filled.svg" : "https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/heart-unfilled.svg"}
      />
    </div>
  )
  if (audio) return <Image />

  return (
    <div
      class={classNames(
        `heart ${myDataContains(id) ? "Like" : "Unlike"}`,
        css`
          opacity: ${environment ? '1 !important' : 'unset'};
          margin: ${animation ? '12px' : '0px'};
          position: absolute;
          z-index: 1;
          left: auto;
          top: 0%;
          right: 0%;
          bottom: 0%;
          display: flex;
          width: auto;
          height: 100%;
          padding-top: 0%;
          padding-bottom: 0%;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
        `
      )}
    >
      <div
        class={css`
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          width: auto;
          height: 100%;
          -webkit-box-orient: vertical;
          -webkit-box-direction: normal;
          -webkit-flex-direction: column;
          -ms-flex-direction: column;
          flex-direction: column;
          -webkit-box-pack: justify;
          -webkit-justify-content: space-between;
          -ms-flex-pack: justify;
          justify-content: space-between;
          -webkit-box-align: center;
          -webkit-align-items: center;
          -ms-flex-align: center;
          align-items: center;
        `}
      >
        <Image />
      </div>
    </div>
  )
}

const CategoriesItem = ({ id, thumbUrl, name, onOpenItemClick, isMyData }) => {
  const { myDataContains, myName, isMyItemOpened, onDragStart } = useContext(Context);
  const [ status, setStatus ] = useState(false);

  function loadImage(url) {
    var image = new Image();
    image.src = url;
    return true;
  }
  return (
    <div
      onClick={(e) => {
        onOpenItemClick(e);
        setTimeout(() => {
          setStatus(myDataContains(id));
        }, 200);
      }}
      draggable={isMyItemOpened}
      ondragstart={() => onDragStart(id)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        $(".slide-menu").hide();
        var { top, left } = $(e.target).parent()[0].getBoundingClientRect();
        var folderItemMenu = $(e.target).parent().find(".slide-menu");
        folderItemMenu.css("left", ( e.clientX - left ) + 'px' );
        folderItemMenu.css("top", ( e.clientY - top ) + 'px' );
        folderItemMenu.show();
      }}
      class={css`
        position: relative;
        height: 167px;
        max-height: 167px;
        overflow: hidden;
        cursor: ${isMyItemOpened ? "initial" : "pointer"};

        &:first-child {
          margin-left: 0;
        }
        ${slideMenuParentCSS}
      `}
    >
      {loadImage(thumbUrl) && <SlideMenu id={id} borderRadius={0} />}
      {(!isMyData  || myName != "environment") && <Heart id={id} status={status} environment={myName == "environment"}/>}
      <div
        class={classNames(
          css`
            position: absolute;
            height: 130px;
            width: 100%;
            background-position: ${isMyData ? "right" : "center"};
            background-size: cover;
            background-repeat: no-repeat;
          `,
          {
            [css`
              //TODO: add condition
              //transition: all 3s;
              &:hover,
              &:focus {
                //transform: scale(1.3);
              }
            `]: isBrowser && !isMyData && myName !== "environment",
          }
        )}
        style={{
          backgroundImage: `url(${thumbUrl})`,
        }}
      />
      <div
        class={classNames(
          "categoryTitle",
          css`
          position: absolute;
          bottom: 0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          flex: 0 auto;
          width: 100%;
          height: 40px;
          margin: 0;
          padding: 0;
          padding-left: 10%;
          align-items: center;
          border-top: 0.5px none #1e2742;
          // border-bottom: 0.5px solid #1e2742;
          background-color: black;
          cursor: pointer;
        `)}
      >
        <div
          class={css`
            color: #7292db;
            font-size: 12px;
            font-weight: 400;
            flex: 1;
            font-family: Montserrat, sans-serif;
            text-transform: capitalize;
          `}
        >
          {name}
        </div>
      </div>
    </div>
  )
}

const LottieItem = ({ id, url, name }) => {
  const { isMyItemOpened, onAddToMyClick, onDragStart, addingToMy } = useContext(Context)

  return (
    <div
      draggable={isMyItemOpened}
      ondragstart={() => onDragStart(id)}
      class={css`
        position: relative;
        margin-bottom: 0px;

        height: 100%;
        width: 100%;
        cursor: "pointer";

        ${slideMenuParentCSS}
      `}
      onClick={(e) => onAddToMyClick(e, id)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        $(".slide-menu").hide();
        var { top, left } = $(e.target).parent()[0].getBoundingClientRect();
        var folderItemMenu = $(e.target).parent().find(".slide-menu");
        folderItemMenu.css("left", ( e.clientX - left ) + 'px' );
        folderItemMenu.css("top", ( e.clientY - top ) + 'px' );
        folderItemMenu.show();
      }}
    >
      {addingToMy(id) && <Spinner isMasonry={true} />}
      <SlideMenu id={id} borderRadius={0} />
      <Heart id={id} animation={true}/>

      <Lottie
        style={{ height: "400px" }}
        path={url}
        class={css`
          display: flex;
          align-items: center;
          justify-content: center;
          height: 90%;

          border-style: solid;
          border-width: 1px;
          border-color: #1e2742;
          background-color: transparent;

          & > svg {
            display: block;
          }
        `}
        loop
        play
      />
      <div
        class={css`
          display: flex;
          align-items: center;
          height: 25px;
          padding-left: 10px;
          align-items: center;
          border-style: none solid solid;
          border-width: 1px;
          border-color: #1e2742;
          background-color: black;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          color: #7292db;
          font-size: 12px;
          line-height: 12px;
          font-weight: 200;
          white-space: nowrap;
        `}
      >
        {name}
      </div>
    </div>
  )
}

const Audio = ({ id, name, src, activeAudio, setActiveAudio }) => {
  const player = useRef()
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState("00:00")
  const { myDataContains, onAddToMyClick, isMyItemOpened, onDragStart } = useContext(Context)
  
  useEffect(()=>{
    if (id != activeAudio && player) {
      player.current.stop();
    }
  }, [activeAudio]);
  return (
    <div
      draggable={isMyItemOpened}
      ondragstart={() => onDragStart(id)}
      onClick={(e) => onAddToMyClick(e, id)}
      class={classNames(
        "player",
        css`
          position: relative;
          display: flex;
          height: 32px;
          margin-top: 0px;
          padding-right: 15px;
          padding-left: 15px;
          -webkit-box-pack: justify;
          justify-content: space-between;
          -webkit-box-align: center;
          align-items: center;
          border-top: 1px none rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 0px;
          background-color: transparent;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          font-size: 12px;
          cursor: pointer;

          &:hover {
            background-color: #0f141e;
          }
          
          & > .duration {
            display: ${myDataContains(id) ? 'none' : 'block'}
          }

          &:hover >.duration {
            display: ${myDataContains(id) ? 'block' : 'none'}
          }
        `
      )}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          setActiveAudio(id);
          playing ? setPlaying(false) : setPlaying(true)
        }}
        class={css`
          cursor: pointer;
        `}
      >
        {playing ? (
          <div
            class={css`
              display: flex;
              width: 12px;
              height: 12px;
              justify-content: center;
              -webkit-box-align: center;
              align-items: center;
              flex: 0 0 auto;
              border-style: solid;
              border-width: 1px;
              border-color: #7292db;
              background-color: #7292db;
            `}
          />
        ) : (
          <img
            src="https://assets.website-files.com/616a041ea72c58e139ed3c8e/616a041ea72c582627ed3cb0_iconfinder-icon%20(3).svg"
            width="9"
          />
        )}
      </div>
      <div
        class={css`
          padding-left: 15px;
          flex-grow: 1;
        `}
      >
        {name}
      </div>
      <div class="duration" style={{paddingRight: "4px"}}>{duration}</div>
      <Heart id={id} audio={true} />
      <ReactHowler
        onLoad={() => {
          setDuration(dayjs(player.current.duration() * 1000).format("mm:ss.SSS"))
        }}
        onEnd={() => {
          setPlaying(false)
        }}
        onStop={() => {
          setPlaying(false)
        }}
        ref={player}
        src={src}
        preload={false}
        html5={true}
        playing={playing}
      />
    </div>
  )
}

const Unsplash = ({}) => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [error, setError] = useState()
  const [query, setQuery] = useState("")
  const debouncedSetQuery = useDebouncedCallback((value) => setQuery(value), 1000)
  const { addingToMy, uploadToMy } = useContext(Context)

  var unsplashID = "7uvLOvcJobn4kUszQ-ftApVAtjbt1wvq1oJTgKBlbPc"
  const getUrl = () => {
    const page = !items.length ? 1 : items.length / 20
    if (query)
      return `https://api.unsplash.com/search/photos?client_id=${unsplashID}&query=${query}&page=${page}&per_page=20`
    return `https://api.unsplash.com/photos?client_id=${unsplashID}&page=${page}&per_page=20`
  }

  const loadMore = (isNewQuery) => {
    setLoading(true)
    $.get(getUrl(), (data) => {
      data = query ? data.results : data
      isNewQuery ? setItems(data) : setItems((prev) => [...prev, ...data])
      setHasNextPage(true)
      setLoading(false)
      //        setError(err)
    })
  }

  useEffect(() => {
    loadMore(true)
  }, [query])

  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: !!error,
    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: "0px 0px 400px 0px",
  })

  return (
    <div class={css`
      display: flex;
      flex-direction: column;
      height: 100%;
    `}>
      <div
        class={css`
          padding-top: 30px;
          margin: 15px;
        `}
      >
        <input
          type="text"
          placeholder={""}
          onChange={(e) => debouncedSetQuery(e.target.value)}
          class={classes.searchInput}
        />
        <a target="_blank" href="https://unsplash.com/" class={css`
          margin-left: -70px;
          line-height: 30px;
        `}>Unsplash</a>
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={css`
          display: flex;
          margin-left: 0px; /* gutter size offset */
          padding-left: 16px;
          padding-right: 16px;
          width: auto;
          gap: 10px;
          flex: 1;
          overflow-y: scroll;
        `}
        columnClassName={css`
          padding-left: 0px; /* gutter size */
          background-clip: padding-box;
          & > div {
            // background: grey;
            margin-bottom: 1rem;
          }
        `}
      >
        {items.map((item) => {
          return (
            <div
              class={css`
                cursor: pointer;
                position: relative;
              `}
            >
              {addingToMy(item.id) && <Spinner isMasonry={true} />}

              <img
                key={item.id}
                onClick={(e) => uploadToMy(e, "Image", item.urls.regular, item.id)}
                src={item.urls.regular}
                // loading="lazy"
                class={css`
                  ${addingToMy(item.id) && ""}
                `}
              >
                {item.name}
              </img>
            </div>
          )
        })}
      </Masonry>

      {/* {hasNextPage && <div style="padding-left: 16px;" ref={infiniteRef}>Loading...</div>} */}
    </div>
  )
}

const Pixabay = ({}) => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [error, setError] = useState()
  const [query, setQuery] = useState("")
  const debouncedSetQuery = useDebouncedCallback((value) => setQuery(value), 1000)
  const { addingToMy, uploadToMy } = useContext(Context)

  var pixabayKey = "15962911-94d039aef78b595bfb0bf5385"
  const loadMore = (isNewQuery) => {
    setLoading(true)
    const page = !items.length ? 1 : items.length / 20
    const url = `https://pixabay.com/api/videos/?key=${pixabayKey}&q=${query}&page=${page}`
    $.get(url, (data) => {
      data = data.hits.map(({ id, picture_id, videos, user }) => {
        return {
          id,
          thumb: `https://i.vimeocdn.com/video/${picture_id}_295x166.jpg`,
          url: videos.tiny.url,
          name: user + "_" + id,
        }
      })

      isNewQuery ? setItems(data) : setItems((prev) => [...prev, ...data])
      setHasNextPage(true)
      setLoading(false)
      // setError(err)
    })
    //test
    // for (var i = 0; i < 10; i ++) {
    //   items.push(
    //     {
    //       id: 29 + i, thumb: "https://d1i82wgyy7ipwz.cloudfront.net/publishes/aa/thumbnail.jpg?Expires=1684839021&Key-Pair-Id=K2U1INTATTGJXK&Signature=wNX03aTlBq7updIOAkkqB4xqfaLAlCvM7CAkCGhRY0itHsI8NwULa8JvUtJtZ4tK-6hTPzV7gsRs2NgvMtmi~UQ92IhZL0I0jCznimzSjKzaABVgRM9M2cs1o6Tl-MfTAC~SyokQjwMZfEL~i5qaMO7sArKtv~Fc9X5Bui9c36BukL4veK622fZx8xrLwcekCwWzS2Tv26UpcHQS7h8LF4mq4PKmobzzW94Ww2qPe9S~rXbk0N4LvSt767BGwZ7gAOVVzQssqW6bZvJp1r51lo-J-KbFgG73~sEjhPsDn6OUO3SAVC3nW53MZZjiHcZspAbacGxrpJ1o4dpPH4kS2g__", 
    //       url: "https://d1i82wgyy7ipwz.cloudfront.net/publishes/aa/thumbnail.jpg?Expires=1684839021&Key-Pair-Id=K2U1INTATTGJXK&Signature=wNX03aTlBq7updIOAkkqB4xqfaLAlCvM7CAkCGhRY0itHsI8NwULa8JvUtJtZ4tK-6hTPzV7gsRs2NgvMtmi~UQ92IhZL0I0jCznimzSjKzaABVgRM9M2cs1o6Tl-MfTAC~SyokQjwMZfEL~i5qaMO7sArKtv~Fc9X5Bui9c36BukL4veK622fZx8xrLwcekCwWzS2Tv26UpcHQS7h8LF4mq4PKmobzzW94Ww2qPe9S~rXbk0N4LvSt767BGwZ7gAOVVzQssqW6bZvJp1r51lo-J-KbFgG73~sEjhPsDn6OUO3SAVC3nW53MZZjiHcZspAbacGxrpJ1o4dpPH4kS2g__", 
    //       name: "Videos"
    //     }
    //   );
    // }
  }

  useEffect(() => {
    loadMore(true)
  }, [query])

  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: !!error,
    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: "0px 0px 400px 0px",
  })

  return (
    <div class={css`
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: scroll;
    `}>
      <div
        class={css`
          padding-top: 30px;
          margin: 15px;
          margin-bottom: 0px;
        `}
      >
        <input
          type="text"
          placeholder={""}
          onChange={(e) => debouncedSetQuery(e.target.value)}
          class={classes.searchInput}
        />
      </div>

      <div
        class={css`
          display: grid;
          --n: 4;
          flex: 1;
          padding: 16px;
          padding-top: 0px;
          gap: 10px;
          overflow-y: scroll;
          grid-template-columns: repeat(auto-fill, minmax(max(200px, 100% / var(--n)), 1fr));
        `}
      >
        {items.map(({ id, thumb, url, name }) => {
          if (url.indexOf("/progressive_redirect/") > 0) return

          // if (addingToMy(id)) {
          //   return <Spinner />
          // }
          return (
            <PixabayVideo
              name={name}
              onUploadToMyClick={(e) => uploadToMy(e, "Video", url, id)}
              id={id}
              thumb={thumb}
              url={url}
            />
          )
        })}
      </div>

      {/* {hasNextPage && <div style="padding-left: 16px;" ref={infiniteRef}>Loading...</div>} */}
    </div>
  )
}

const PixabayVideo = ({ id, url, thumb, onUploadToMyClick, name }) => {
  const [preview, setPreview] = useState(false)
  const [initialPreview, setInitialPreview] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { isMyItemOpened, onDragStart, addingToMy } = useContext(Context)

  const class_ = css`
    width: 100%;
    cursor: pointer;
  `
  return (
    <div
      key={id}
      onClick={(e) => onUploadToMyClick(e)}
      draggable={isMyItemOpened}
      ondragstart={() => onDragStart(id)}
      onMouseEnter={() => {
        setInitialPreview(true)
        setPreview(true)
      }}
      onMouseLeave={() => setPreview(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        $(".slide-menu").hide();
        var { top, left } = $(e.target).parent()[0].getBoundingClientRect();
        var folderItemMenu = $(e.target).parent().find(".slide-menu");
        folderItemMenu.css("left", ( e.clientX - left ) + 'px' );
        folderItemMenu.css("top", ( e.clientY - top ) + 'px' );
        folderItemMenu.show();
      }}
    >
      <div
        class={css`
          overflow: hidden;
          ${slideMenuParentCSS}
        `}
      >
        {addingToMy(id) && <Spinner isMasonry={true}/>}
        <SlideMenu id={id} />
        <Heart id={id} />

        {initialPreview && (
          <video
            onloadeddata={() => setLoaded(true)}
            style={{ display: preview && loaded ? "block" : "none" }}
            class={class_}
            src={url}
            autoplay
            muted
          />
        )}

        {thumb ? (
          <img
            class={class_}
            loading="lazy"
            style={{ display: preview && loaded ? "none" : "block" }}
            src={thumb}
          />
        ) : (
          <video
            style={{ display: preview && loaded ? "none" : "block" }}
            class={class_}
            src={url + "#t=0.1"}
            preload="metadata"
            muted
          />
        )}
      </div>
      {/* <div
        class={css`
          padding-top: 10px;
          color: #7292db;
          font-family: Exo, sans-serif;
          font-size: 12px;
          font-weight: 200;
          white-space: nowrap;
          text-transform: capitalize;
          vertical-align: middle;
        `}
      >
        {name}
      </div> */}
    </div>
  )
}

class Menu extends Component {
  render({ onClick, portalMenu, activeItem }, {}) {
    return (
      <div>
        {menuItems.map((i) => {
            return (
              <div
                onClick={() => onClick(i)}
                className={classNames(
                  "tab-item",
                  "js-accordion-item",
                  "portal-item",
                  i.name,
                  {
                    active: activeItem === i.name,
                  },
                  "show"
                )}
                key={i.name}
              >
                <div class="js-accordion-header">{i.name}</div>
                <div class="js-accordion-body"></div>
              </div>
            )
          })}
      </div>
    )
    return
  }
}

const classes = {
  accordionTitle: css`
    display: flex;
    width: 100%;
    align-self: center;
    flex: 1;
    color: #7292db;
    font-size: 12px;
    font-weight: 200;
    white-space: nowrap;
  `,
  searchInput: css`
    flex: 1;
    font-size: 18px;
    font-weight: 200;
    padding-left: 40px;
    color: #7292db;
    cursor: pointer;
    outline: 0;
    border: 1px solid rgba(76, 110, 147, 0.32);
    height: 30px;
    line-height: 30px;
    width: 100%;
    color: #7292db;
    font-size: 12px;
    font-weight: 200;
    border-radius: 6px;
    background: url("https://assets.website-files.com/616a041ea72c58e139ed3c8e/616a041ea72c58e49bed3cf1_Engine-icons-search_icon.svg")
      no-repeat left;
    background-size: 17px;
    background-position: 12px;

    &::placeholder {
      /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: #7292db;
      opacity: 1; /* Firefox */
    }
  `,
}

const Spinner = ({ size = 10, isMasonry }) => {
  const borderSize = (1.1 / 10) * size

  return (
    <div
      class={css`
        &,
        &:after {
          border-radius: 50%;
          width: ${size}em;
          height: ${size}em;
        }
        & {
          margin: auto;
          font-size: 10px;
          ${isMasonry
            ? `
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          `
            : `position: relative;`}

          text-indent: -9999em;
          border-top: ${borderSize}em solid rgba(255, 255, 255, 0.2);
          border-right: ${borderSize}em solid rgba(255, 255, 255, 0.2);
          border-bottom: ${borderSize}em solid rgba(255, 255, 255, 0.2);
          border-left: ${borderSize}em solid #ffffff;
          -webkit-transform: translateZ(0);
          -ms-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-animation: load8 1.1s infinite linear;
          animation: load8 1.1s infinite linear;
        }
        @-webkit-keyframes load8 {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
        @keyframes load8 {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
      `}
    />
  )
}

const InlineEdit = ({ value, setValue, forceReadOnly }) => {
  const [readOnly, setReadOnly] = useState(true)
  const [editingValue, setEditingValue] = useState(value)

  const onChange = (event) => setEditingValue(event.target.value)

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === "Escape") {
      event.target.blur()
    }
  }

  const onBlur = (event) => {
    if (event.target.value.trim() === "") {
      setEditingValue(value)
    } else {
      setValue(event.target.value)
    }

    setReadOnly(true)
  }

  const onDoubleClick = (e) => {
    e.stopPropagation()
    setReadOnly(false)
  }

  return (
    <input
      type="text"
      value={editingValue}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      readOnly={forceReadOnly || readOnly}
      class={classes.accordionTitle}
      onDoubleClick={onDoubleClick}
      style={{ cursor: readOnly ? "pointer" : "" }}
    />
  )
}

const parseData = (data) => {
  if (Array.isArray(data)) return data

  let newData = []

  for (const [k1, v1] of Object.entries(data)) {
    const r1 = { name: k1, id: v1.id, thumbUrl: v1.thumbUrl, items: [] }

    for (const [k2, v2] of Object.entries(v1.children)) {
      const r2 = { name: k2, id: v2.id, url: v2.url, thumbUrl: v2.thumbUrl }

      if (v2.children) {
        r1.accordion = true
        r2.items = []
        for (const [k3, v3] of Object.entries(v2.children)) {
          const r3 = { id: v3.id, name: k3, url: v3.url, thumbUrl: v3.thumbUrl }

          if (v3.children) {
            r2.accordion = true
            r3.items = []
            for (const [k4, v4] of Object.entries(v3.children)) {
              const r4 = { name: k4, id: v4.id, url: v4.url, thumbUrl: v4.thumbUrl }
              r3.items.push(r4)
            }
          }
          r2.items.push(r3)
        }
      }

      r1.items.push(r2)
    }

    newData.push(r1)
  }

  return newData
}

const menuItems = [
  { name: "geometry", myName: "geometry", url: "/asset/geometry/list", exts: ["obj", "fbx"] },
  { name: "materials", myName: "material", url: "/asset/material/list", exts: ["obj", "fbx"] },
  { name: "images", myName: "image", url: "/asset/image/list", exts: ["obj", "fbx"] },
  { name: "audio", myName: "audio", url: "/asset/audio/list", exts: ["obj", "fbx"] },
  { name: "video", myName: "video", exts: ["obj", "fbx"] },
  { name: "animation", myName: "animation", url: "/asset/animation/list", exts: ["obj", "fbx"] },
  {
    name: "environment",
    myName: "environment",
    url: "/asset/environment/list",
    exts: ["obj", "fbx"],
  },
]

const breakpointColumnsObj = {
  default: 2,
  1100: 2,
  700: 2,
  500: 1,
}

const insert = (arr, index, newItem) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index),
]
render(<Tabs />, document.getElementById("js-accordion-assets"))

if (module.hot) {
  module.hot.accept()
}
