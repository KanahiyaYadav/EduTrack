package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Student model
type Student struct {
	gorm.Model
	Name    string
	Math    int
	Science int
	English int
}

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

var db *gorm.DB

func initDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = db.AutoMigrate(&Student{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}

func main() {
	initDB()

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.POST("/upload", func(c *gin.Context) {
		var students []map[string]string

		if err := c.BindJSON(&students); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		for _, data := range students {
			student := Student{
				Name: data["Name"],
			}
			fmt.Sscanf(data["Math"], "%d", &student.Math)
			fmt.Sscanf(data["Science"], "%d", &student.Science)
			fmt.Sscanf(data["English"], "%d", &student.English)

			db.Create(&student)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Data saved to database",
			"count":   len(students),
		})
	})

	router.GET("/students", func(c *gin.Context) {
		var students []Student
		result := db.Find(&students)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}
		c.JSON(http.StatusOK, students)
	})

	router.GET("/analytics", func(c *gin.Context) {
		var students []Student
		result := db.Find(&students)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		if len(students) == 0 {
			c.JSON(http.StatusOK, gin.H{
				"message": "No student data available for analytics.",
			})
			return
		}

		// Prepare input data
		var inputData []map[string]interface{}
		for _, s := range students {
			record := map[string]interface{}{
				"Name":    s.Name,
				"Math":    s.Math,
				"Science": s.Science,
				"English": s.English,
			}
			inputData = append(inputData, record)
		}

		jsonData, err := json.Marshal(inputData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize student data"})
			return
		}

		// Show current working directory
		cwd, _ := os.Getwd()
		fmt.Println("Working Directory:", cwd)

		// Execute the Python script
		cmd := exec.Command("python", "./analytics/analyze.py")
		cmd.Stdin = bytes.NewReader(jsonData)

		var out bytes.Buffer
		var stderr bytes.Buffer
		cmd.Stdout = &out
		cmd.Stderr = &stderr

		fmt.Println("Running Python script...")

		if err := cmd.Run(); err != nil {
			fmt.Println("Python stderr:", stderr.String())
			fmt.Println("Python stdout:", out.String())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Python script failed",
				"details": stderr.String(),
			})
			return
		}

		fmt.Println("Python output:", out.String())

		var resultData map[string]interface{}
		if err := json.Unmarshal(out.Bytes(), &resultData); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Invalid JSON returned by Python script",
				"details": out.String(),
			})
			return
		}

		c.JSON(http.StatusOK, resultData)
	})

	router.Run(":8080")
}
